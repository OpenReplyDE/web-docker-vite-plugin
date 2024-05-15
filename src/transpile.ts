const importToWindow = (
  scope: string,
  module: string,
  code: string,
  key: string,
) => {
  const removedEnter = code.replace(/\n/g, "");
  const removedExtraSpaces = removedEnter.replace(/\s+/g, " ");

  const importRegex = new RegExp(String.raw`import\s?{(.*?)}\s?from\s?"${key}"`, "g");
  const defaultRegex = new RegExp(String.raw`import\s?(.*?)\s?from\s?"${key}"`, "g");

  const toWindowObject = removedExtraSpaces
    .replace(importRegex, `const {$1} = window["${scope}"]["${module}"]["${key}"]`)
    .replace(defaultRegex, `const $1 = window["${scope}"]["${module}"]["${key}"]`);

  const windowRegex = new RegExp(
    String.raw`const {(.*?)} = window\["${scope}"\]\["${module}"\]\["${key}"\];`,
  );
  const match = toWindowObject.match(windowRegex);

  if (match && match[1].includes("as")) {
    const imports = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    const assignments = imports
      .map((i) => {
        const [original, alias] = i.split(" as ");
        return `${original}: ${alias || original}`;
      })
      .join(", ");
    return toWindowObject.replace(windowRegex,`const { ${assignments} } = window["${scope}"]["${module}"]["${key}"];`);
  }
  return toWindowObject;
};

const aliasToObject = (alias: string) => {
  const [key, value] = alias.split(" as ");
  return `{ ${value}: ${key} }`;
};

// todo here the module key should be used for the actual regex not every import
const importToContainer = (scope: string, module: string, code: string) => {
  const removedEnter = code.replace(/\n/g, "");
  const removedExtraSpaces = removedEnter.replace(/\s+/g, " ");
  const aliasMatch = removedExtraSpaces.match(/export {\s*(.*?) as (.*?)\s*};/);

  if (aliasMatch) {
    const object = aliasMatch[1];
    const alias = aliasMatch[2];

    const notation = `{ ${alias}: ${object} }`;

    return code.concat(` window["${scope}"]["${module}"] = ${notation};`);
  }

  const exportMatch = removedExtraSpaces.match(/export { (.*?) };/);

  if (exportMatch) {
    return code.concat(
      ` window["${scope}"]["${module}"] = { ${exportMatch[1]} };`,
    );
  }

  if (!exportMatch) {
    return code;
  }
};

export { importToWindow, importToContainer, aliasToObject };
