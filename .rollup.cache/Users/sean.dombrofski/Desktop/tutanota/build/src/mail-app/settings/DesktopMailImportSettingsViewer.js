import m from "mithril";
import { IconButton } from "../../common/gui/base/IconButton";
import { assertNotNull } from "@tutao/tutanota-utils";
import { getFolderName, getIndentedFolderNameForDropdown, getPathToFolderString } from "../mail/model/MailUtils";
import { HighestTierPlans, MailSetKind, PlanType } from "../../common/api/common/TutanotaConstants";
import { lang } from "../../common/misc/LanguageViewModel";
import { elementIdPart, generatedIdToTimestamp, isSameId, sortCompareByReverseId } from "../../common/api/common/utils/EntityUtils";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
import { showNotAvailableForFreeDialog } from "../../common/misc/SubscriptionDialogs.js";
import { ProgressBar, ProgressBarType } from "../../common/gui/base/ProgressBar.js";
import { ExpanderButton, ExpanderPanel } from "../../common/gui/base/Expander.js";
import { Table } from "../../common/gui/base/Table.js";
import { mailLocator } from "../mailLocator.js";
import { formatDate } from "../../common/misc/Formatter.js";
import { LoginButton } from "../../common/gui/base/buttons/LoginButton";
/**
 * Settings viewer for mail import rendered only in the Desktop client.
 * See {@link WebMailImportSettingsViewer} for other views.
 */
export class DesktopMailImportSettingsViewer {
    mailImporter;
    isImportHistoryExpanded = true;
    importStatePoolHandle;
    constructor(mailImporter) {
        this.mailImporter = mailImporter;
    }
    async oninit() {
        await this.mailImporter().initImportMailStates();
    }
    onbeforeremove() {
        clearInterval(this.importStatePoolHandle);
    }
    view() {
        return m(".fill-absolute.scroll.plr-l.pb-xl", [
            m(".h4.mt-l", lang.get("mailImportSettings_label")),
            this.renderTargetFolderControls(),
            !this.mailImporter().shouldRenderImportStatus() ? this.renderStartNewImportControls() : null,
            this.mailImporter().shouldRenderImportStatus() ? this.renderImportStatus() : null,
            this.renderImportHistory(),
        ]);
    }
    async onImportButtonClick(dom) {
        const currentPlanType = await mailLocator.logins.getUserController().getPlanType();
        const isHighestTierPlan = HighestTierPlans.includes(currentPlanType);
        if (!isHighestTierPlan) {
            showNotAvailableForFreeDialog([PlanType.Legend, PlanType.Unlimited]).then();
            return;
        }
        const allowedExtensions = ["eml", "mbox"];
        const filePaths = await mailLocator.fileApp.openFileChooser(dom.getBoundingClientRect(), allowedExtensions, true);
        await this.mailImporter().onStartBtnClick(filePaths.map((fp) => fp.location));
    }
    renderTargetFolderControls() {
        let folders = this.mailImporter().foldersForMailbox;
        if (folders) {
            const loadingMsg = lang.get("loading_msg");
            const emptyLabel = m("br");
            const selectedTargetFolder = this.mailImporter().selectedTargetFolder;
            const selectedTargetFolderPath = selectedTargetFolder ? getPathToFolderString(folders, selectedTargetFolder) : "";
            const isNotSubfolder = selectedTargetFolder ? selectedTargetFolderPath == getFolderName(selectedTargetFolder) : false;
            const helpLabel = selectedTargetFolder ? (isNotSubfolder ? emptyLabel : selectedTargetFolderPath) : emptyLabel;
            // do not allow importing to inbox folder,
            // problem:
            // if a folder receives/imports a very large amount of mails (hundreds of thousands) that all get moved/deleted at once,
            // the backend will not be able to read any live data from that list for a while.
            // if that happens, user will not see incoming mails in their inbox folder for that time,
            // this problem can still happen on other folders,
            // but at least we won't block inbox ( incoming new mails )
            const selectableFolders = folders.getIndentedList().filter((folderInfo) => folderInfo.folder.folderType !== MailSetKind.INBOX);
            let targetFolders = selectableFolders.map((folderInfo) => {
                return {
                    name: getIndentedFolderNameForDropdown(folderInfo),
                    value: folderInfo.folder,
                };
            });
            return m(DropDownSelector, {
                label: "mailImportTargetFolder_label",
                items: targetFolders,
                disabled: this.mailImporter().shouldRenderImportStatus(),
                selectedValue: selectedTargetFolder,
                selectedValueDisplay: selectedTargetFolder ? getFolderName(selectedTargetFolder) : loadingMsg,
                selectionChangedHandler: (newFolder) => (this.mailImporter().selectedTargetFolder = newFolder),
                helpLabel: () => helpLabel,
            });
        }
        else {
            return null;
        }
    }
    renderStartNewImportControls() {
        return [
            m(".flex-start.mt-m", this.renderImportInfoText()),
            m(".flex-start.mt-s", m(LoginButton, {
                type: "FlexWidth" /* LoginButtonType.FlexWidth */,
                label: "import_action",
                onclick: (_, dom) => this.onImportButtonClick(dom),
            })),
        ];
    }
    renderImportInfoText() {
        return [m(".small", lang.get("mailImportInfoText_label"))];
    }
    renderImportStatus() {
        const processedMailsCountLabel = m(".flex-start.p.small", lang.get("mailImportStateProcessedMailsTotalMails_label", {
            "{processedMails}": this.mailImporter().getProcessedMailsCount(),
            "{totalMails}": this.mailImporter().getTotalMailsCount(),
        }));
        const resumeMailImportIconButtonAttrs = {
            title: "resumeMailImport_action",
            icon: "Play" /* Icons.Play */,
            click: () => this.mailImporter().onResumeBtnClick(),
            size: 0 /* ButtonSize.Normal */,
            disabled: this.mailImporter().shouldDisableResumeButton(),
        };
        const pauseMailImportIconButtonAttrs = {
            title: "pauseMailImport_action",
            icon: "Pause" /* Icons.Pause */,
            click: () => {
                this.mailImporter().onPauseBtnClick();
            },
            size: 0 /* ButtonSize.Normal */,
            disabled: this.mailImporter().shouldDisablePauseButton(),
        };
        const cancelMailImportIconButtonAttrs = {
            title: "cancelMailImport_action",
            icon: "Cancel" /* Icons.Cancel */,
            click: () => {
                this.mailImporter().onCancelBtnClick();
            },
            size: 0 /* ButtonSize.Normal */,
            disabled: this.mailImporter().shouldDisableCancelButton(),
        };
        let buttonControls = [];
        if (this.mailImporter().shouldRenderPauseButton()) {
            buttonControls.push(m(IconButton, pauseMailImportIconButtonAttrs));
        }
        if (this.mailImporter().shouldRenderResumeButton()) {
            buttonControls.push(m(IconButton, resumeMailImportIconButtonAttrs));
        }
        if (this.mailImporter().shouldRenderCancelButton()) {
            buttonControls.push(m(IconButton, cancelMailImportIconButtonAttrs));
        }
        return [
            [
                m(".flex-space-between.p.small.mt-m", getReadableUiImportStatus(assertNotNull(this.mailImporter().getUiStatus())), this.mailImporter().shouldRenderProcessedMails() ? processedMailsCountLabel : null),
            ],
            [m(".flex-space-between.border-radius-big.mt-s.rel.nav-bg.full-width", this.renderMailImportProgressBar(), ...buttonControls)],
        ];
    }
    renderMailImportProgressBar() {
        // the ProgressBar uses progress values 0 ... 1
        return m(".rel.border-radius-big.full-width", m(ProgressBar, {
            progress: this.mailImporter().getProgress() / 100,
            type: ProgressBarType.Large,
        }));
    }
    renderImportHistory() {
        return [
            m(".flex-space-between.items-center.mt-l.mb-s", [
                m(".h4", lang.get("mailImportHistory_label")),
                m(ExpanderButton, {
                    label: "show_action",
                    expanded: this.isImportHistoryExpanded,
                    onExpandedChange: () => {
                        this.isImportHistoryExpanded = !this.isImportHistoryExpanded;
                    },
                }),
            ]),
            m(ExpanderPanel, {
                expanded: this.isImportHistoryExpanded,
            }, m(Table, {
                columnHeading: ["mailImportHistoryTableHeading_label"],
                columnWidths: [".column-width-small" /* ColumnWidth.Small */, ".column-width-largest" /* ColumnWidth.Largest */],
                showActionButtonColumn: true,
                lines: this.makeMailImportHistoryTableLines(),
            })),
        ];
    }
    /**
     * Parses the importMailStates into displayable table lines.
     * @returns array of the parsed table lines.
     */
    makeMailImportHistoryTableLines() {
        let folders = this.mailImporter().foldersForMailbox?.getIndentedList();
        if (folders) {
            return this.mailImporter()
                .getFinalisedImports()
                .sort(sortCompareByReverseId)
                .map((im) => {
                const targetFolderId = im.targetFolder;
                const displayTargetFolder = folders.find((f) => isSameId(f.folder._id, targetFolderId));
                return {
                    cells: () => [
                        {
                            main: lang.get("mailImportHistoryTableRowTitle_label", {
                                "{status}": getReadableImportStatus(parseInt(im.status)),
                                "{folder}": displayTargetFolder
                                    ? getFolderName(displayTargetFolder.folder)
                                    : lang.get("mailImportHistoryTableRowFolderDeleted_label"),
                            }),
                            info: [
                                lang.get("mailImportHistoryTableRowSubtitle_label", {
                                    "{date}": formatDate(new Date(generatedIdToTimestamp(elementIdPart(im._id)))),
                                    "{successfulMails}": im.successfulMails,
                                    "{failedMails}": im.failedMails,
                                }),
                            ],
                        },
                    ],
                };
            });
        }
        else {
            return [];
        }
    }
    async entityEventsReceived(updates) { }
}
export function getReadableUiImportStatus(uiStatus) {
    return lang.get(getUiImportStatusTranslationKey(uiStatus));
}
export function getUiImportStatusTranslationKey(uiStatus) {
    switch (uiStatus) {
        case 0 /* UiImportStatus.Starting */:
            return "mailImportStatusStarting_label";
        case 1 /* UiImportStatus.Resuming */:
            return "mailImportStatusResuming_label";
        case 2 /* UiImportStatus.Running */:
            return "mailImportStatusRunning_label";
        case 3 /* UiImportStatus.Pausing */:
            return "mailImportStatusPausing_label";
        case 4 /* UiImportStatus.Paused */:
            return "mailImportStatusPaused_label";
        case 5 /* UiImportStatus.Cancelling */:
            return "mailImportStatusCancelling_label";
    }
}
export function getReadableImportStatus(importStatus) {
    return lang.get(getImportStatusTranslationKey(importStatus));
}
export function getImportStatusTranslationKey(importStatus) {
    switch (importStatus) {
        case 0 /* ImportStatus.Running */:
            return "mailImportStatusRunning_label";
        case 1 /* ImportStatus.Paused */:
            return "mailImportStatusPaused_label";
        case 2 /* ImportStatus.Canceled */:
            return "mailImportStatusCanceled_label";
        case 3 /* ImportStatus.Finished */:
            return "mailImportStatusFinished_label";
    }
}
//# sourceMappingURL=DesktopMailImportSettingsViewer.js.map