import m from "mithril";
import { assertMainOrNode } from "../../../common/api/common/Env.js";
import { AccountMaintenanceSettings } from "../../../common/settings/AccountMaintenanceSettings.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { LazyLoaded, neverNull, noOp, promiseMap } from "@tutao/tutanota-utils";
import { CustomerPropertiesTypeRef, CustomerServerPropertiesTypeRef, CustomerTypeRef, } from "../../../common/api/entities/sys/TypeRefs.js";
import stream from "mithril/stream";
import { calendarLocator } from "../../calendarLocator.js";
assertMainOrNode();
export class GlobalSettingsViewer {
    props = stream();
    accountMaintenanceUpdateNotifier = null;
    customerProperties = new LazyLoaded(() => calendarLocator.entityClient
        .load(CustomerTypeRef, neverNull(calendarLocator.logins.getUserController().user.customer))
        .then((customer) => calendarLocator.entityClient.load(CustomerPropertiesTypeRef, neverNull(customer.properties))));
    constructor() {
        this.customerProperties.getAsync().then(m.redraw);
        this.updateCustomerServerProperties();
        this.view = this.view.bind(this);
    }
    view() {
        return m("#global-settings.fill-absolute.scroll.plr-l", [
            m(AccountMaintenanceSettings, {
                customerServerProperties: this.props,
                setOnUpdateHandler: (fn) => {
                    this.accountMaintenanceUpdateNotifier = fn;
                },
            }),
        ]);
    }
    updateCustomerServerProperties() {
        return calendarLocator.customerFacade.loadCustomerServerProperties().then((props) => {
            this.props(props);
            m.redraw();
        });
    }
    entityEventsReceived(updates) {
        this.accountMaintenanceUpdateNotifier?.(updates);
        return promiseMap(updates, (update) => {
            if (isUpdateForTypeRef(CustomerServerPropertiesTypeRef, update) && update.operation === "1" /* OperationType.UPDATE */) {
                return this.updateCustomerServerProperties();
            }
        }).then(noOp);
    }
}
//# sourceMappingURL=GlobalSettingsViewer.js.map