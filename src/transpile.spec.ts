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
        `export { method }; window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { method: method });`,
      );
    });
    it("imports aliased module to container", () => {
      const code = `export { oa as object };`;

      const result = importToContainer(scope, module, code, "object");

      expect(result).toEqual(
        `export { oa as object }; window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { object: oa });`,
      );
    });
    it("imports indented aliased module to container", () => {
      const code = `
      export {
        oa as object
      };`;

      const result = importToContainer(scope, module, code, "object");

      expect(result).toEqual(
        `${code} window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { object: oa });`,
      );
    });

    it("keeps both keys when called twice with different keys against the same code and module", () => {
      const code = `export { method, method2 };`;

      const result = importToContainer(scope, module, code, "method");
      const result2 = importToContainer(scope, module, result, "method2");

      expect(result2).toContain(
        `window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { method: method });`,
      );
      expect(result2).toContain(
        `window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { method2: method2 });`,
      );
    });

    it("only includes the requested key from a multi-identifier export list", () => {
      const code = `export { method, method2, method3 };`;

      const result = importToContainer(scope, module, code, "method2");

      expect(result).toEqual(
        `export { method, method2, method3 }; window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { method2: method2 });`,
      );
      expect(result).not.toContain("method:");
      expect(result).not.toContain("method3:");
    });

    it("leaves code unchanged when the key is absent from the export list", () => {
      const code = `export { method, method2, method3 };`;

      const result = importToContainer(scope, module, code, "notThere");

      expect(result).toEqual(code);
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
      `${code} window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { method: ka }); window["scope"]["module2"] = Object.assign(window["scope"]["module2"] || {}, { method2: Ma });`,
    );
  });

  it("leaves an earlier rewritten import untouched when a second key is transpiled", () => {
    const code = `import { ref as R, toRaw as U } from "vue";import { Button as B } from "primevue";`;

    const first = importFromContainer(scope, "vue-slot", code, "vue");
    const second = importFromContainer(scope, "primevue-slot", first, "primevue");

    expect(second).toEqual(
      `const { ref: R, toRaw: U } = window["scope"]["vue-slot"]["vue"];const { Button: B } = window["scope"]["primevue-slot"]["primevue"];`,
    );
  });

  it("rewrites every named import of the same key in one chunk", () => {
    const code = `import { a as x } from "example";console.log(1);import { b as y } from "example";`;

    const result = importFromContainer(scope, module, code, "example");

    expect(result).toEqual(
      `const { a: x } = window["scope"]["module"]["example"];console.log(1);const { b: y } = window["scope"]["module"]["example"];`,
    );
  });

  it("does not span statements when rewriting a default import", () => {
    const code = `import { other } from "other";import method from "example";`;

    const result = importFromContainer(scope, module, code, "example");

    expect(result).toEqual(
      `import { other } from "other";const method = window["scope"]["module"]["example"];`,
    );
  });

  it("rewrites a namespace import", () => {
    const code = `import * as everything from "example";`;

    const result = importFromContainer(scope, module, code, "example");

    expect(result).toEqual(
      `const everything = window["scope"]["module"]["example"];`,
    );
  });

  it("does not match a key that is a prefix of another exported alias", () => {
    const code = `export { oa as objectExtra };`;

    const result = importToContainer(scope, module, code, "object");

    expect(result).toEqual(code);
  });

  it("finds a key exported from a later export statement", () => {
    const code = `const a=1;export { a as alpha };export { a as beta };`;

    const result = importToContainer(scope, module, code, "beta");

    expect(result).toEqual(
      `${code} window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { beta: a });`,
    );
  });

  it("finds a key in a minified export statement", () => {
    const code = `export{a};`;

    const result = importToContainer(scope, module, code, "a");

    expect(result).toEqual(
      `export{a}; window["scope"]["module"] = Object.assign(window["scope"]["module"] || {}, { a: a });`,
    );
  });

  it("preserves newlines when rewriting a multi-line import to the window lookup", () => {
    const code = `import {\n  method,\n  method2\n} from "example";\n\nconsole.log(method);`;

    const result = importFromContainer(scope, module, code, "example");

    expect(result).toContain("\n");
    expect(result).toContain(
      `const {\n  method,\n  method2\n} = window["scope"]["module"]["example"]`,
    );
  });
});
