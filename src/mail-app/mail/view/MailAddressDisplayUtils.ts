/**
 * Enhanced mail address display utilities with domain replacement support
 */

import { getMailAddressDisplayText } from "../../../common/mailFunctionality/SharedMailUtils.js"
import { getDisplayedSender } from "../../../common/api/common/CommonMailUtils.js"
import { replaceMailAddressDomain } from "./DomainReplacementUtils.js"
import { initializeDomainReplacements } from "./DomainReplacementConfig.js"
import { Mail } from "../../../common/api/entities/tutanota/TypeRefs.js"

// Initialize domain replacement rules once on module load
initializeDomainReplacements()

/**
 * Enhanced version of getMailAddressDisplayText that applies domain replacements
 * @param name The sender name
 * @param address The sender email address
 * @param preferNameOnly Whether to prefer name only display
 * @returns The formatted display text with domain replacements applied
 */
export function getMailAddressDisplayTextWithDomainReplacement(name: string | null, address: string, preferNameOnly: boolean): string {
	// Apply domain replacement to the address
	const replacedAddress = replaceMailAddressDomain({ name, address }).address

	// Use the original function with the replaced address
	return getMailAddressDisplayText(name, replacedAddress, preferNameOnly)
}

/**
 * Enhanced version of getDisplayedSender that applies domain replacements
 * @param mail The mail object
 * @returns The displayed sender with domain replacements applied
 */
export function getDisplayedSenderWithDomainReplacement(mail: Mail) {
	const originalSender = getDisplayedSender(mail)

	if (!originalSender) {
		return originalSender
	}

	// Apply domain replacement to the sender
	return replaceMailAddressDomain(originalSender)
}

/**
 * Enhanced version of getSenderOrRecipientHeading that applies domain replacements
 * @param mail The mail object
 * @param preferNameOnly Whether to prefer name only display
 * @returns The sender or recipient heading with domain replacements applied
 */
export function getSenderOrRecipientHeadingWithDomainReplacement(mail: Mail, preferNameOnly: boolean): string {
	if (mail.state === "0") {
		// MailState.RECEIVED
		const sender = getDisplayedSenderWithDomainReplacement(mail)
		return getMailAddressDisplayTextWithDomainReplacement(sender.name, sender.address, preferNameOnly)
	} else {
		// For sent mails, we might want to apply domain replacement to recipients too
		// This would require similar logic for recipients
		return getMailAddressDisplayTextWithDomainReplacement(null, mail.sender.address, preferNameOnly)
	}
}
