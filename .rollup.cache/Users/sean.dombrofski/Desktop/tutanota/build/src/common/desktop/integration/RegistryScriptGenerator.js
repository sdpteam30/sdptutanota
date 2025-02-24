const header_line = "Windows Registry Editor Version 5.00";
function quote(s) {
    return `"${s}"`;
}
function keyLine(path) {
    return `[${path}]`;
}
function valueLine(path, value) {
    return `${path === "" ? "@" : quote(path)}=${value == null ? "-" : quote(value)}`;
}
/**
 * value expander for the script generators. if a value is not a string, it's another section
 * that gets expanded recursively.
 *
 * remove is used to create value/key removal lines
 */
function expandValue(path, key, value, buf, remove) {
    if (typeof value === "string") {
        buf[path].push(valueLine(key, remove ? null : value));
    }
    else {
        buf = expandSection(`${path}\\${key}`, value, buf, remove);
    }
    return buf;
}
/**
 * section expander for the script generator
 */
function expandSection(path, value, buf, remove) {
    if (buf[path] == null)
        buf[path] = [];
    for (const key in value) {
        if (typeof value[key] !== "string" && remove) {
            buf[`-${path}\\${key}`] = [];
        }
        else {
            expandValue(path, key, value[key], buf, remove);
        }
    }
    return buf;
}
/**
 * converts a map of registry paths to value setters into an executable registry script
 * @param {OperationBuffer} buf List of operations the need to be done
 * @returns {string} a windows registry script that can be imported by regex.exe to apply the operations
 */
function bufToScript(buf) {
    const lines = [header_line];
    for (const key in buf) {
        const next = buf[key];
        if (next.length < 1 && !key.startsWith("-"))
            continue;
        lines.push("", keyLine(key));
        lines.push(...next);
    }
    return lines.join("\r\n").trim();
}
/**
 * the application and removal script generators are very similar in structure, this function abstracts over that.
 */
function scriptBuilder(remove, template) {
    const buf = template.reduce((prev, { root, value }) => expandSection(root, value, prev, remove), {});
    return bufToScript(buf);
}
/**
 * create a windows registry script that can be executed to apply the given template
 */
export function applyScriptBuilder(template) {
    return scriptBuilder(false, template);
}
/**
 * create a windows registry script that can be executed to remove the values that have been
 * created by executing the script generated from the template by applyScriptBuilder
 */
export function removeScriptBuilder(template) {
    return scriptBuilder(true, template);
}
//# sourceMappingURL=RegistryScriptGenerator.js.map