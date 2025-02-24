/**
 * this receives inter window events and dispatches them to all other windows
 */
export class DesktopExternalCalendarFacade {
    async fetchExternalCalendar(url) {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Failed to fetch external calendar ${response.statusText}`);
        return await response.text();
    }
}
//# sourceMappingURL=DesktopExternalCalendarFacade.js.map