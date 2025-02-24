/* generated file, don't edit. */
export class ThemeFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "getThemes": {
                return this.facade.getThemes();
            }
            case "setThemes": {
                const themes = arg[0];
                return this.facade.setThemes(themes);
            }
            case "getThemePreference": {
                return this.facade.getThemePreference();
            }
            case "setThemePreference": {
                const themePreference = arg[0];
                return this.facade.setThemePreference(themePreference);
            }
            case "prefersDark": {
                return this.facade.prefersDark();
            }
        }
    }
}
//# sourceMappingURL=ThemeFacadeReceiveDispatcher.js.map