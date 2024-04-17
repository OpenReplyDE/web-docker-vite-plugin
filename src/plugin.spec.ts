import { expect, describe, it, vi } from "vitest";
import { ObservedModuleConfig, PageModuleConfig, create } from "./plugin";
describe("plugin", function () {
  it("constructs", function () {
    const config: ObservedModuleConfig = {
      type: "observed",
      module: "some-element",
      selector: "some-element",
    };

    const plugin = create({basePath: "/", fileName: "filename", entry: './test', ...config});

    expect(plugin.name).toEqual("ViteWebDockerRemoteFile");
  });

  it("generates remote config of event module type", function () {
    expect.assertions(2);

    const config: ObservedModuleConfig = {
      type: "observed",
      module: "some-element",
      selector: "some-element",
    };

    const plugin = create({basePath: "/", fileName: "filename", entry: './test', ...config}) as {
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

    const plugin = create({basePath: "/", fileName: "filename", entry: './test', ...config}) as {
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

    const plugin = create({basePath: "/", fileName: "filename", entry: './test', ...config}) as {
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
        "source": {
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

    const plugin = create({basePath: "/", fileName: "filename", entry: './test', ...config}) as {
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

    const plugin = create({basePath: "/", fileName: "filename", entry: './test', ...config}) as {
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
});
