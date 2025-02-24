import m from "mithril";
import { lang } from "../../../../misc/LanguageViewModel.js";
import { SetupPageLayout } from "./SetupPageLayout.js";
export class SetupCongratulationsPage {
    view() {
        return m(SetupPageLayout, { image: "congratulations", class: "onboarding-logo-large" }, [
            m("h2.mt-l.b", lang.get("welcome_text")),
            m("p.mt-s.full-width", lang.get("onboarding_text")),
        ]);
    }
}
export class SetupCongratulationsPageAttrs {
    preventGoBack = true;
    hidePagingButtonForPage = false;
    data = null;
    headerTitle() {
        return "welcome_label";
    }
    nextAction(showDialogs) {
        // next action not available for this page
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=SetupCongraulationsPage.js.map