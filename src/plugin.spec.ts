import { expect, describe, it, vi } from "vitest";
import { ObservedModuleConfig, PageModuleConfig, create } from "./plugin";
describe("plugin", function () {
  it("constructs", function () {
    const config: ObservedModuleConfig = {
      type: "observed",
      module: "some-element",
      selector: "some-element",
    };

    const plugin = create({ basePath: "/", fileName: "filename", ...config });

    expect(plugin.name).toEqual("ViteWebDockerRemoteFile");
  });

  it("generates remote config of observed module type", function () {
    expect.assertions(2);

    const config: ObservedModuleConfig = {
      type: "observed",
      module: "some-element",
      selector: "some-element",
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      ...config,
    }) as {
      name: string;
      generateBundle: (plugin: any, {}, {}) => void;
      emitFile: (arg0: {
        fileName: string;
        source: string;
        type: string;
      }) => void;
    };

    plugin.emitFile = vi.fn();

    expect(plugin.name).toEqual("ViteWebDockerRemoteFile");

    plugin.generateBundle(plugin, {}, {});

    expect(plugin.emitFile).toHaveBeenCalledWith({
      fileName: "filename",
      source:
        '{"version":"1.0.0","type":"observed","assets":[],"module":"some-element","selector":"some-element"}',
      type: "asset",
    });
  });

  it("generates remote config of page module type", function () {
    expect.assertions(1);

    const config: PageModuleConfig = {
      type: "page",
      module: "some-element",
      pages: ["select", "/heyobi/.*"],
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      ...config,
    }) as {
      name: string;
      generateBundle: (plugin: any, {}, {}) => void;
      emitFile: (arg0: {
        fileName: string;
        source: string;
        type: string;
      }) => void;
    };

    plugin.emitFile = vi.fn();

    plugin.generateBundle(plugin, {}, {});

    expect(plugin.emitFile).toHaveBeenCalledWith({
      fileName: "filename",
      source:
        '{"version":"1.0.0","type":"page","assets":[],"module":"some-element","pages":["select","/heyobi/.*"]}',
      type: "asset",
    });
  });

  it("generates remote config with js assets", function () {
    expect.assertions(1);

    const config: PageModuleConfig = {
      type: "page",
      module: "some-element",
      pages: [],
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      ...config,
    }) as {
      name: string;
      generateBundle: ({}, {}) => void;
      emitFile: (arg0: {
        fileName: string;
        source: string;
        type: string;
      }) => void;
    };

    plugin.emitFile = vi.fn();

    plugin.generateBundle(
      {},
      {
        source: {
          type: "chunk",
          fileName: "filename.js",
        },
      }
    );

    expect(plugin.emitFile).toHaveBeenCalledWith({
      fileName: "filename",
      source:
        '{"version":"1.0.0","type":"page","assets":[{"type":"js","buildType":"modern","src":"/filename.js"}],"module":"some-element","pages":[]}',
      type: "asset",
    });
  });

  it("generates remote config with css assets", function () {
    expect.assertions(1);

    const config: PageModuleConfig = {
      type: "page",
      module: "some-element",
      pages: [],
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      ...config,
    }) as {
      name: string;
      generateBundle: ({}, {}) => void;
      emitFile: (arg0: {
        fileName: string;
        source: string;
        type: string;
      }) => void;
    };

    plugin.emitFile = vi.fn();

    plugin.generateBundle(
      {},
      {
        "css-file": {
          type: "asset",
          fileName: "css-file.css",
        },
      }
    );

    expect(plugin.emitFile).toHaveBeenCalledWith({
      fileName: "filename",
      source:
        '{"version":"1.0.0","type":"page","assets":[{"type":"css","src":"/css-file.css"}],"module":"some-element","pages":[]}',
      type: "asset",
    });
  });

  it("generates remote config with js and css assets", function () {
    expect.assertions(1);

    const config: PageModuleConfig = {
      type: "page",
      module: "some-element",
      pages: [],
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      ...config,
    }) as {
      name: string;
      generateBundle: ({}, {}) => void;
      emitFile: (arg0: {
        fileName: string;
        source: string;
        type: string;
      }) => void;
    };

    plugin.emitFile = vi.fn();

    plugin.generateBundle(
      {},
      {
        "js-file": {
          type: "chunk",
          fileName: "js-file.js",
        },
        "css-file.css": {
          type: "asset",
          fileName: "css-file.css",
        },
      }
    );

    expect(plugin.emitFile).toHaveBeenCalledWith({
      fileName: "filename",
      source:
        '{"version":"1.0.0","type":"page","assets":[{"type":"js","buildType":"modern","src":"/js-file.js"},{"type":"css","src":"/css-file.css"}],"module":"some-element","pages":[]}',
      type: "asset",
    });
  });
  it("generates remote config of page module type as shared module", function () {
    expect.assertions(2);

    const config: PageModuleConfig = {
      pages: [],
      type: "page",
      module: "some-element",
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      use: {
        vue: "vue-module",
      },
      ...config,
    }) as {
      name: string;
      generateBundle: (plugin: any, {}, {}) => void;
      emitFile: (arg0: {
        fileName: string;
        source: string;
        type: string;
      }) => void;
    };

    plugin.emitFile = vi.fn();

    expect(plugin.name).toEqual("ViteWebDockerRemoteFile");

    plugin.generateBundle(plugin, {}, {});

    expect(plugin.emitFile).toHaveBeenCalledWith({
      fileName: "filename",
      source:
        '{"version":"1.0.0","type":"page","assets":[],"module":"some-element","pages":[],"use":{"vue":"vue-module"}}',
      type: "asset",
    });
  });

  it("rewrites every used module in a chunk without corrupting earlier rewrites", function () {
    expect.assertions(1);

    const config: PageModuleConfig = {
      pages: [],
      type: "page",
      module: "some-element",
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      use: {
        vue: "vue-module",
        primevue: "primevue-module",
        lodash: "lodash-module",
      },
      ...config,
    }) as {
      generateBundle: ({}, {}) => void;
      emitFile: (arg0: {}) => void;
    };

    plugin.emitFile = vi.fn();

    const chunk = {
      type: "chunk",
      fileName: "main.js",
      code: `import { ref as R, toRaw as U } from "vue";import { Button as B } from "primevue";import { merge as M } from "lodash";`,
    };

    plugin.generateBundle({}, { main: chunk });

    expect(chunk.code).toEqual(
      `const { ref: R, toRaw: U } = window["webdocker"]["vue-module"]["vue"];const { Button: B } = window["webdocker"]["primevue-module"]["primevue"];const { merge: M } = window["webdocker"]["lodash-module"]["lodash"];`,
    );
  });

  it("exposes every configured key from a chunk while also rewriting used modules", function () {
    expect.assertions(1);

    const config: PageModuleConfig = {
      pages: [],
      type: "page",
      module: "some-element",
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      use: {
        vue: "vue-module",
      },
      exposes: {
        alpha: "alpha",
        beta: "beta",
      },
      ...config,
    }) as {
      generateBundle: ({}, {}) => void;
      emitFile: (arg0: {}) => void;
    };

    plugin.emitFile = vi.fn();

    const chunk = {
      type: "chunk",
      fileName: "main.js",
      code: `import { ref as R } from "vue";const b=2;export { R as alpha };export { b as beta };`,
    };

    plugin.generateBundle({}, { main: chunk });

    expect(chunk.code).toEqual(
      `const { ref: R } = window["webdocker"]["vue-module"]["vue"];const b=2;export { R as alpha };export { b as beta };` +
        ` window["webdocker"]["some-element"] = Object.assign(window["webdocker"]["some-element"] || {}, { alpha: R });` +
        ` window["webdocker"]["some-element"] = Object.assign(window["webdocker"]["some-element"] || {}, { beta: b });`,
    );
  });

  it("marks used modules as external in build.rollupOptions.external", function () {
    const config: PageModuleConfig = {
      pages: [],
      type: "page",
      module: "some-element",
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      use: {
        vue: "shared-vue-3-5-17",
      },
      ...config,
    }) as { config: () => any };

    const result = plugin.config();

    expect(result.build.rollupOptions.external).toContain("vue");
  });

  it("returns nothing from the config hook when no use is configured", function () {
    const config: PageModuleConfig = {
      pages: [],
      type: "page",
      module: "some-element",
    };

    const plugin = create({
      basePath: "/",
      fileName: "filename",
      ...config,
    }) as { config: () => any };

    const result = plugin.config();

    expect(result).toBeUndefined();
  });
});
