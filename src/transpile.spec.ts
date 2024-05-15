import { importToWindow, importToContainer, aliasToObject } from "./transpile";
import { describe, expect, it } from "vitest";

import { readFileSync } from 'fs';

const scope = "scope";
const module = "module";
describe("transpile", () => {
  describe("importToWindow", () => {
    it("replaces import with import from window", () => {
      const code = `import { method } from "example";`;

      const result = importToWindow(scope, module, code, "example");

      expect(result).toEqual(
        `const { method } = window["scope"]["module"]["example"];`,
      );
    });

    it("replaces multiple named imports with import from window", () => {
      const code = `import { method, method2 } from "example";`;

      const result = importToWindow(scope, module, code, "example");

      expect(result).toEqual(
        `const { method, method2 } = window["scope"]["module"]["example"];`,
      );
    });

    it("replaces default imports with import from window", () => {
      const code = `import method from "example";`;

      const result = importToWindow(scope, module, code, "example");

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

      const result = importToWindow(scope, module, code, "vue");

      expect(result).toEqual(
        `const { defineComponent: d, ref: g, openBlock: p } = window["scope"]["module"]["vue"];`,
      );
    });

    it("renders from file", () => {
      const code = readFileSync("./index-test.js", "utf8");

      const result = importToWindow(scope, module, code, "vue");

      expect(result).toContain(
        `const { defineComponent: d, ref: g, openBlock: p, createElementBlock: m, createElementVNode: i, toDisplayString: a, Fragment: _, createVNode: v, pushScopeId: w, popScopeId: y, createApp: L } = window["scope"]["module"]["vue"];`,
      );
    });
  });

  describe("importToContainer", () => {
    it("imports module to container", () => {
      const code = `export { method };`;

      const result = importToContainer(scope, module, code);

      expect(result).toEqual(
        `export { method }; window["scope"]["module"] = { method };`,
      );
    });
    it("imports aliased module to container", () => {
      const code = `export { oa as object };`;

      const result = importToContainer(scope, module, code);

      expect(result).toEqual(
        `export { oa as object }; window["scope"]["module"] = { object: oa };`,
      );
    });
    it("imports idented aliased module to container", () => {
      const code = `
      export {
        oa as object
      };`;

      const result = importToContainer(scope, module, code);

      expect(result).toEqual(
        `${code} window["scope"]["module"] = { object: oa };`,
      );
    });
  });

  describe("aliasToObj", () => {
    it("converts alias to object", () => {
      const alias = "something as object";

      const result = aliasToObject(alias);

      expect(result).toEqual(`{ object: something }`);
    });
  });
});
