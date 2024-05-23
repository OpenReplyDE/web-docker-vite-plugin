const importFromContainer = (
  scope: string,
  module: string,
  code: string,
  key: string
) => {
  const removedEnter = code.replace(/\n/g, "");
  const removedExtraSpaces = removedEnter.replace(/\s+/g, " ");

  const importRegex = new RegExp(
    String.raw`import\s?{(.*?)}\s?from\s?"${key}"`,
    "g"
  );
  const defaultRegex = new RegExp(
    String.raw`import\s?(.*?)\s?from\s?"${key}"`,
    "g"
  );

  const toWindowObject = removedExtraSpaces
    .replace(
      importRegex,
      `const {$1} = window["${scope}"]["${module}"]["${key}"]`
    )
    .replace(
      defaultRegex,
      `const $1 = window["${scope}"]["${module}"]["${key}"]`
    );

  const windowRegex = new RegExp(
    String.raw`const {(.*?)} = window\["${scope}"\]\["${module}"\]\["${key}"\];`
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
    return toWindowObject.replace(
      windowRegex,
      `const { ${assignments} } = window["${scope}"]["${module}"]["${key}"];`
    );
  }
  return toWindowObject;
};

const importToContainer = (
  scope: string,
  module: string,
  code: string,
  key: string
) => {
  const removedEnter = code.replace(/\n/g, "");
  const removedExtraSpaces = removedEnter.replace(/\s+/g, " ");

  const aliases = removedExtraSpaces.match(/export\s*{([^}]*)};/);

  if (aliases) {
    const aliasMatch = aliases[1].match(String.raw`(\w+)\s+as\s+${key}`);

    if (aliasMatch) {
      const object = aliasMatch[1].replace(/\s+/g, "");
      return code.concat(` window["${scope}"]["${module}"]={${key}:${object}};`);
    }
  }

  const exportMatch = removedExtraSpaces.match(/export { (.*?) };/);

  if (exportMatch) {
    return code.concat(
      ` window["${scope}"]["${module}"] = { ${exportMatch[1]} };`
    );
  }

  return code;
};

export { importFromContainer, importToContainer };
