const importFromContainer = (
  scope: string,
  module: string,
  code: string,
  key: string
) => {
  const importRegex = new RegExp(
    String.raw`import\s*{([\s\S]*?)}\s*from\s*"${key}"`,
    "g"
  );
  const defaultRegex = new RegExp(
    String.raw`import\s*([\s\S]*?)\s*from\s*"${key}"`,
    "g"
  );

  const toWindowObject = code
    .replace(
      importRegex,
      `const {$1} = window["${scope}"]["${module}"]["${key}"]`
    )
    .replace(
      defaultRegex,
      `const $1 = window["${scope}"]["${module}"]["${key}"]`
    );

  const windowRegex = new RegExp(
    String.raw`const {([\s\S]*?)} = window\["${scope}"\]\["${module}"\]\["${key}"\];`
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
      return code.concat(
        ` window["${scope}"]["${module}"] = Object.assign(window["${scope}"]["${module}"] || {}, { ${key}: ${object} });`
      );
    }
  }

  const exportMatch = removedExtraSpaces.match(/export { (.*?) };/);

  if (exportMatch) {
    const exportedNames = exportMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (!exportedNames.includes(key)) {
      return code;
    }

    return code.concat(
      ` window["${scope}"]["${module}"] = Object.assign(window["${scope}"]["${module}"] || {}, { ${key}: ${key} });`
    );
  }

  return code;
};

export { importFromContainer, importToContainer };
