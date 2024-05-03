import type { Plugin } from "vite";

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
    entry: string;
  } & ModuleConfig
): Plugin => {
  let entryFile: string;
  if (!config.basePath)
    throw new Error(
      "web docker: basePath is required. This prepends the script and css paths in remote config files."
    );
  if (!config.module)
    throw new Error(
      "web docker: fileName is required. This is the name of the remote config file."
    );

  if (!config.fileName)
    throw new Error(
      "web docker: fileName is required. This is the name of the remote config file."
    );

  if (!config.type)
    throw new Error(
      "web docker: type is required. This is the type of the remote config file."
    );

  return {
    name: "ViteWebDockerRemoteFile",
    buildStart() {
      entryFile = this.emitFile({
        type: "chunk",
        id: config.entry,
      });
    },
    generateBundle(_, bundle) {
      const css: Array<string> = [];
      const js: Array<string> = [];
      // Find all the generated CSS assets

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === "chunk" && chunk.fileName.endsWith(".js"))
          js.push(chunk.fileName);
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
        if (entryFile) {
          js.push(this.getFileName(entryFile));
        }
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
        } else if (config.type === "page" && config.pages) {
          configString += `"pages":[${config.pages
            .map((p) => `"${p}"`)
            .join(",")}]}`;
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
