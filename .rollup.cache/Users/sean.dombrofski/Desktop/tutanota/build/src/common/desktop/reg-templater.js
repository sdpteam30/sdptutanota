import { applyScriptBuilder, removeScriptBuilder } from "./integration/RegistryScriptGenerator";
export var RegistryRoot;
(function (RegistryRoot) {
    /** Global (per-device) registry keys */
    RegistryRoot["LOCAL_MACHINE"] = "HKEY_LOCAL_MACHINE";
    /** Per-user registry keys */
    RegistryRoot["CURRENT_USER"] = "HKEY_CURRENT_USER";
})(RegistryRoot || (RegistryRoot = {}));
/**
 * > The HKEY_CLASSES_ROOT (HKCR) key contains file name extension associations and COM class registration information such as ProgIDs, CLSIDs, and IIDs.
 * > It is primarily intended for compatibility with the registry in 16-bit Windows.
 *
 * see https://docs.microsoft.com/en-us/windows/win32/sysinfo/hkey-classes-root-key
 */
const HKCR = "HKEY_CLASSES_ROOT";
/**
 * get a registry template specific to tutanota desktop
 * https://docs.microsoft.com/en-us/windows/win32/msi/installation-context#registry-redirection
 */
function getTemplate(opts, registryRoot) {
    const { execPath, dllPath, logPath, tmpPath } = opts;
    const client_template = {
        tutanota: {
            "": "tutanota",
            DLLPath: dllPath,
            EXEPath: execPath,
            LOGPath: logPath,
            TMPPath: tmpPath,
        },
        "": "tutanota",
    };
    const mailto_template = {
        "": "URL:MailTo Protocol",
        "URL Protocol": "",
        FriendlyTypeName: "Tutanota URL",
        shell: {
            open: {
                command: {
                    "": `\\"${execPath}\\" \\"%1\\"`,
                },
            },
        },
    };
    const capabilities_template = {
        tutao: {
            tutanota: {
                Capabilities: {
                    ApplicationName: "Tutanota Desktop",
                    ApplicationDescription: "",
                    UrlAssociations: {
                        mailto: "tutanota.Mailto",
                    },
                },
            },
        },
    };
    return [
        {
            root: `${registryRoot}\\SOFTWARE\\Clients\\Mail`,
            value: client_template,
        },
        {
            root: `${registryRoot}\\SOFTWARE\\CLASSES`,
            value: {
                mailto: mailto_template,
                "tutanota.Mailto": mailto_template,
            },
        },
        {
            root: HKCR,
            value: {
                mailto: mailto_template,
                "tutanota.Mailto": mailto_template,
            },
        },
        {
            root: `${registryRoot}\\SOFTWARE\\RegisteredApplications`,
            value: {
                tutanota: "SOFTWARE\\\\tutao\\\\tutanota\\\\Capabilities",
            },
        },
        {
            root: `${registryRoot}\\SOFTWARE\\Wow6432Node\\RegisteredApplications`,
            value: {
                tutanota: "SOFTWARE\\\\Wow6432Node\\\\tutao\\\\tutanota\\\\Capabilities",
            },
        },
        {
            root: `${registryRoot}\\SOFTWARE`,
            value: capabilities_template,
        },
        {
            root: `${registryRoot}\\SOFTWARE\\Wow6432Node`,
            value: capabilities_template,
        },
    ];
}
function escape(s) {
    return s.replace(/\\/g, "\\\\");
}
/**
 * produce a tmp windows registry script to register an executable as a mailto handler
 * @param registryRoot
 * @param opts {RegistryPaths}
 * @returns {string} registry script
 */
export function makeRegisterKeysScript(registryRoot, opts) {
    const { execPath, dllPath, logPath, tmpPath } = opts;
    const template = getTemplate({
        execPath: escape(execPath),
        dllPath: escape(dllPath),
        logPath: escape(logPath),
        tmpPath: escape(tmpPath),
    }, registryRoot);
    return applyScriptBuilder(template);
}
/**
 * produce a tmp windows registry script to unregister tutanota as a mailto handler
 * @returns {string} registry script
 */
export function makeUnregisterKeysScript(registryRoot) {
    // the removal script generator doesn't care about values
    const template = getTemplate({
        execPath: "execPath",
        dllPath: "dllPath",
        logPath: "logPath",
        tmpPath: "tmpPath",
    }, registryRoot);
    return removeScriptBuilder(template);
}
//# sourceMappingURL=reg-templater.js.map