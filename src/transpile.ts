const importFromContainer = (
  scope: string,
  module: string,
  code: string,
  key: string
) => {
  const container = `window["${scope}"]["${module}"]["${key}"]`;

  const namedImportRegex = new RegExp(
    String.raw`import\s*{([\s\S]*?)}\s*from\s*"${key}"`,
    "g"
  );
  const namespaceImportRegex = new RegExp(
    String.raw`import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s*from\s*"${key}"`,
    "g"
  );
  const defaultImportRegex = new RegExp(
    String.raw`import\s+([A-Za-z_$][\w$]*)\s*from\s*"${key}"`,
    "g"
  );

  return code
    .replace(
      namedImportRegex,
      (_match, names: string) => `const {${toBindings(names)}} = ${container}`
    )
    .replace(namespaceImportRegex, `const $1 = ${container}`)
    .replace(defaultImportRegex, `const $1 = ${container}`);
};

const toBindings = (names: string) => {
  if (!names.includes(" as ")) {
    return names;
  }

  const bindings = names
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name)
    .map((name) => {
      const [original, alias] = name.split(" as ");
      return `${original.trim()}: ${(alias || original).trim()}`;
    })
    .join(", ");

  return ` ${bindings} `;
};

const importToContainer = (
  scope: string,
  module: string,
  code: string,
  key: string
) => {
  const removedEnter = code.replace(/\n/g, "");
  const removedExtraSpaces = removedEnter.replace(/\s+/g, " ");

  const local = localNameOf(removedExtraSpaces, key);

  if (!local) {
    return code;
  }

  return code.concat(
    ` window["${scope}"]["${module}"] = Object.assign(window["${scope}"]["${module}"] || {}, { ${key}: ${local} });`
  );
};

const localNameOf = (code: string, key: string) => {
  const exportRegex = /export\s*{([^}]*)};/g;

  let statement = exportRegex.exec(code);

  while (statement) {
    const exported = exportedNameOf(statement[1], key);

    if (exported) {
      return exported;
    }

    statement = exportRegex.exec(code);
  }

  return undefined;
};

const exportedNameOf = (names: string, key: string) => {
  const aliasMatch = names.match(new RegExp(String.raw`(\w+)\s+as\s+${key}\b`));

  if (aliasMatch) {
    return aliasMatch[1].replace(/\s+/g, "");
  }

  const exported = names
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name);

  return exported.includes(key) ? key : undefined;
};

export { importFromContainer, importToContainer };
