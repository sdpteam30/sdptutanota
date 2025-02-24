import { noOp, promiseMap, sortableTimestamp } from "@tutao/tutanota-utils";
import { downloadMailBundle } from "./Bundler";
import { isDesktop } from "../../../common/api/common/Env";
import { locator } from "../../../common/api/main/CommonLocator";
import { zipDataFiles } from "../../../common/file/FileController";
import { CancelledError } from "../../../common/api/common/error/CancelledError.js";
import { generateExportFileName, mailToEmlFile } from "./emlUtils.js";
import { elementIdPart } from "../../../common/api/common/utils/EntityUtils";
export async function generateMailFile(bundle, fileName, mode) {
    return mode === "eml" ? mailToEmlFile(bundle, fileName) : locator.fileApp.mailToMsg(bundle, fileName);
}
export async function getMailExportMode() {
    if (isDesktop()) {
        const ConfigKeys = await import("../../../common/desktop/config/ConfigKeys");
        const mailExportMode = (await locator.desktopSettingsFacade
            .getStringConfigValue(ConfigKeys.DesktopConfigKey.mailExportMode)
            .catch(noOp));
        return mailExportMode ?? "eml";
    }
    else {
        return "eml";
    }
}
/**
 * export mails. a single one will be exported as is, multiple will be put into a zip file
 * a save dialog will then be shown
 * @returns {Promise<Mail[]>} resolved with failed mails or empty after the fileController
 * was instructed to open the new zip File containing the exported files
 */
export async function exportMails(mails, mailFacade, entityClient, fileController, cryptoFacade, operationId, signal) {
    let cancelled = false;
    const onAbort = () => {
        cancelled = true;
    };
    try {
        // Considering that the effort for generating the bundle is higher
        // than generating the files, we need to consider it twice, so the
        // total effort would be (mailsToBundle * 2) + filesToGenerate
        const totalMails = mails.length * 3;
        let doneMails = 0;
        const errorMails = [];
        signal?.addEventListener("abort", onAbort);
        const updateProgress = operationId !== undefined ? () => locator.operationProgressTracker.onProgress(operationId, (++doneMails / totalMails) * 100) : noOp;
        //The only way to skip a Promise is throwing an error.
        //this throws just a CancelledError to be handled by the try/catch statement.
        //This function must be called in each iteration across all promises since
        //throwing it inside the onAbort function doesn't interrupt the pending promises.
        const checkAbortSignal = () => {
            if (cancelled)
                throw new CancelledError("export cancelled");
        };
        const downloadPromise = promiseMap(mails, async (mail) => {
            checkAbortSignal();
            try {
                const { htmlSanitizer } = await import("../../../common/misc/HtmlSanitizer");
                return await downloadMailBundle(mail, mailFacade, entityClient, fileController, htmlSanitizer, cryptoFacade);
            }
            catch (e) {
                errorMails.push(mail);
            }
            finally {
                updateProgress();
                updateProgress();
            }
        });
        const [mode, bundles] = await Promise.all([getMailExportMode(), downloadPromise]);
        const dataFiles = [];
        for (const bundle of bundles) {
            if (!bundle)
                continue;
            checkAbortSignal();
            const mailFile = await generateMailFile(bundle, generateExportFileName(elementIdPart(bundle.mailId), bundle.subject, new Date(bundle.receivedOn), mode), mode);
            dataFiles.push(mailFile);
            updateProgress();
        }
        const zipName = `${sortableTimestamp()}-${mode}-mail-export.zip`;
        const outputFile = await (dataFiles.length === 1 ? dataFiles[0] : zipDataFiles(dataFiles, zipName));
        await fileController.saveDataFile(outputFile);
        return {
            failed: errorMails,
        };
    }
    catch (e) {
        if (e.name !== "CancelledError")
            throw e;
    }
    finally {
        signal?.removeEventListener("abort", onAbort);
    }
    return { failed: [] };
}
//# sourceMappingURL=Exporter.js.map