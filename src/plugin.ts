import type { Plugin } from "vite";
import { importToContainer, importToWindow } from "./transpile";

export type IncludeType = "observed" | "page";
export interface ModuleConfigBase {
  module: string;
  type: IncludeType;
}

export interface ObservedModuleConfig extends ModuleConfigBase {
  type: "observed";
  selector: string;
}

export interface PageInclude {
  include: string;
  exclude?: string;
  exact?: boolean;
}

export interface PageModuleConfig extends ModuleConfigBase {
  type: "page";
  pages: (string | PageInclude)[];
}

type ModuleConfig = ObservedModuleConfig | PageModuleConfig;
export const create = (
  config: {
    fileName: string;
    basePath: string;
    scope?: string;
    exposes?: {
      [key: string]: string;
    };
    use?: {
      [key: string]: string;
    };
  } & ModuleConfig,
): Plugin => {
  if (!config.basePath)
    throw new Error(
      "web docker: basePath is required. This prepends the script and css paths in remote config files.",
    );
  if (!config.module)
    throw new Error(
      "web docker: fileName is required. This is the name of the remote config file.",
    );

  if (!config.fileName)
    throw new Error(
      "web docker: fileName is required. This is the name of the remote config file.",
    );

  if (!config.type)
    throw new Error(
      "web docker: type is required. This is the type of the remote config file.",
    );

  const scope = config.scope || "webdocker";

  return {
    name: "ViteWebDockerRemoteFile",
    generateBundle(_, bundle) {
      const expose = (chunk: any) => {
        for (const key in config.exposes) {
          // TODO: using filename here might be wrong in case of chunk splitting
          if (chunk.fileName.includes(key)) {
            chunk.code = importToContainer(scope, config.module, chunk.code);
          }
        }
      };

      const use = (chunk: any) => {
        for (const key in config.use) {
          chunk.code = importToWindow(scope, config.use[key], chunk.code, key);
        }
      };

      const css: Array<string> = [];
      const js: Array<string> = [];
      // Find all the generated CSS assets

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === "chunk" && chunk.fileName.endsWith(".js")) {
          use(chunk);
          expose(chunk);
          js.push(chunk.fileName);
        }
        if (chunk.type === "asset" && chunk.fileName.endsWith(".css")) {
          const cssFile = config.basePath.concat(chunk.fileName);
          css.push(cssFile);
        }
      }

      const getCssAsset = (src: string) => `{"type":"css","src":"${src}"}`;
      const getJsAsset = (src: string) =>
        `{"type":"js","buildType":"modern","src":"${src}"}`;

      const cssString = () =>
        css.length
          ? js.length
            ? ",".concat(css.map((file) => getCssAsset(file)).join(","))
            : css.map((file) => getCssAsset(file)).join(",")
          : "";

      const jsString = () => {
        return js
          .map((file) => getJsAsset(config.basePath.concat(file)))
          .join(",");
      };
      const getSource = () => {
        let configString = `{"version":"1.0.0","type":"${
          config.type
        }","assets":[${jsString()}${cssString()}],"module":"${config.module}",`;

        if (config.type === "observed") {
          configString += `"selector":"${config.selector}"}`;
        } else if (config.type === "page") {
          if (config.pages) {
            configString += `"pages":[${config.pages
              .map((p) => `"${p}"`)
              .join(",")}]`;
          }
          configString += "}";
        }
        return configString;
      };

      this.emitFile({
        type: "asset",
        fileName: config.fileName,
        source: getSource(),
      });
    },
  };
};
