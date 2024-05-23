import { importFromContainer, importToContainer } from "./transpile";
import { describe, expect, it } from "vitest";

import { readFileSync } from 'fs';

const scope = "scope";
const module = "module";
describe("transpile", () => {
  describe("importToWindow", () => {
    it("replaces import with import from window", () => {
      const code = `import { method } from "example";`;

      const result = importFromContainer(scope, module, code, "example");

      expect(result).toEqual(
        `const { method } = window["scope"]["module"]["example"];`,
      );
    });

    it("replaces multiple named imports with import from window", () => {
      const code = `import { method, method2 } from "example";`;

      const result = importFromContainer(scope, module, code, "example");

      expect(result).toEqual(
        `const { method, method2 } = window["scope"]["module"]["example"];`,
      );
    });

    it("replaces default imports with import from window", () => {
      const code = `import method from "example";`;

      const result = importFromContainer(scope, module, code, "example");

      expect(result).toEqual(
        `const method = window["scope"]["module"]["example"];`,
      );
    });

    it("renders complex import to object assignments", () => {
      const code = `import {
        defineComponent as d,
        ref as g,
        openBlock as p,
      } from "vue";`;

      const result = importFromContainer(scope, module, code, "vue");

      expect(result).toEqual(
        `const { defineComponent: d, ref: g, openBlock: p } = window["scope"]["module"]["vue"];`,
      );
    });

    it("renders from file", () => {
      const code = readFileSync("./index-test.js", "utf8");

      const result = importFromContainer(scope, module, code, "vue");

      expect(result).toContain(
        `const { defineComponent: d, ref: g, openBlock: p, createElementBlock: m, createElementVNode: i, toDisplayString: a, Fragment: _, createVNode: v, pushScopeId: w, popScopeId: y, createApp: L } = window["scope"]["module"]["vue"];`,
      );
    });
  });

  describe("importToContainer", () => {
    it("imports module to container", () => {
      const code = `export { method };`;

      const result = importToContainer(scope, module, code, "method");

      expect(result).toEqual(
        `export { method }; window["scope"]["module"] = { method };`,
      );
    });
    it("imports aliased module to container", () => {
      const code = `export { oa as object };`;

      const result = importToContainer(scope, module, code, "object");

      expect(result).toEqual(
        `export { oa as object }; window["scope"]["module"]={object:oa};`,
      );
    });
    it("imports indented aliased module to container", () => {
      const code = `
      export {
        oa as object
      };`;

      const result = importToContainer(scope, module, code, "object");

      expect(result).toEqual(
        `${code} window["scope"]["module"]={object:oa};`,
      );
    });
  });
  it("imports multiple modules to container", () => {
    const code = `export {
      ka as method,
      Ma as method2
    };`;

    const result = importToContainer(scope, "module", code, "method");
    const result2 = importToContainer(scope, "module2", result, "method2");

    expect(result2).toEqual(
      `${code} window["scope"]["module"]={method:ka}; window["scope"]["module2"]={method2:Ma};`,
    );
  });
});
