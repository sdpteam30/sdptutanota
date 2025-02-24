export async function getDesktopIntegratorForPlatform(electron, fs, childProcess, _winreg) {
    switch (process.platform) {
        case "win32": {
            const { DesktopIntegratorWin32 } = await import("./DesktopIntegratorWin32");
            const winreg = await _winreg();
            return new DesktopIntegratorWin32(electron, winreg.default);
        }
        case "darwin": {
            const { DesktopIntegratorDarwin } = await import("./DesktopIntegratorDarwin.js");
            return new DesktopIntegratorDarwin(electron);
        }
        case "linux": {
            const { DesktopIntegratorLinux } = await import("./DesktopIntegratorLinux");
            return new DesktopIntegratorLinux(electron, fs, childProcess);
        }
        default:
            return Promise.reject(new Error("Invalid Platform"));
    }
}
//# sourceMappingURL=DesktopIntegrator.js.map