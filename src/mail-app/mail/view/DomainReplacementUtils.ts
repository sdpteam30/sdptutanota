/**
 * Utility functions for domain replacement in email addresses
 */

export interface DomainReplacement {
	originalDomain: string
	replacementDomain: string
}

export interface EmailReplacement {
	originalEmail: string
	replacementEmail: string
}

// Configuration for domain replacements
const DOMAIN_REPLACEMENTS: DomainReplacement[] = [
	{
		originalDomain: "tutamail.com",
		replacementDomain: "citytrust.com",
	},
	// Add more domain replacements as needed
]

// Exact email replacements take precedence over domain replacements
const EMAIL_REPLACEMENTS: EmailReplacement[] = []

/**
 * Replaces specific domains in email addresses based on configuration
 * @param emailAddress The email address to process
 * @returns The email address with domain replaced if applicable
 */
export function replaceEmailDomain(emailAddress: string): string {
	if (!emailAddress || !emailAddress.includes("@")) {
		return emailAddress
	}

	// 1) Exact email replacements (case-insensitive)
	const lower = emailAddress.toLowerCase()
	for (const replacement of EMAIL_REPLACEMENTS) {
		if (lower === replacement.originalEmail.toLowerCase()) {
			return replacement.replacementEmail
		}
	}

	// 2) Domain replacements
	for (const replacement of DOMAIN_REPLACEMENTS) {
		if (emailAddress.endsWith("@" + replacement.originalDomain)) {
			const localPart = emailAddress.split("@")[0]
			return `${localPart}@${replacement.replacementDomain}`
		}
	}

	return emailAddress
}

/**
 * Replaces domains in a mail address object
 * @param mailAddress The mail address object to process
 * @returns A new mail address object with domains replaced if applicable
 */
export function replaceMailAddressDomain(mailAddress: { name: string | null; address: string }): { name: string | null; address: string } {
	return {
		name: mailAddress.name,
		address: replaceEmailDomain(mailAddress.address),
	}
}

/**
 * Adds a new domain replacement rule
 * @param originalDomain The domain to replace
 * @param replacementDomain The domain to replace it with
 */
export function addDomainReplacement(originalDomain: string, replacementDomain: string): void {
	// Check if replacement already exists
	const existingIndex = DOMAIN_REPLACEMENTS.findIndex((r) => r.originalDomain === originalDomain)

	if (existingIndex >= 0) {
		// Update existing replacement
		DOMAIN_REPLACEMENTS[existingIndex].replacementDomain = replacementDomain
	} else {
		// Add new replacement
		DOMAIN_REPLACEMENTS.push({ originalDomain, replacementDomain })
	}
}

/**
 * Adds a new exact email replacement rule
 * @param originalEmail The email to replace (case-insensitive)
 * @param replacementEmail The new email to use
 */
export function addEmailReplacement(originalEmail: string, replacementEmail: string): void {
	const existingIndex = EMAIL_REPLACEMENTS.findIndex((r) => r.originalEmail.toLowerCase() === originalEmail.toLowerCase())
	if (existingIndex >= 0) {
		EMAIL_REPLACEMENTS[existingIndex].replacementEmail = replacementEmail
	} else {
		EMAIL_REPLACEMENTS.push({ originalEmail, replacementEmail })
	}
}

/**
 * Removes an exact email replacement rule
 */
export function removeEmailReplacement(originalEmail: string): void {
	const index = EMAIL_REPLACEMENTS.findIndex((r) => r.originalEmail.toLowerCase() === originalEmail.toLowerCase())
	if (index >= 0) {
		EMAIL_REPLACEMENTS.splice(index, 1)
	}
}

/**
 * Gets all current exact email replacement rules
 */
export function getEmailReplacements(): EmailReplacement[] {
	return [...EMAIL_REPLACEMENTS]
}

/**
 * Removes a domain replacement rule
 * @param originalDomain The domain to remove from replacements
 */
export function removeDomainReplacement(originalDomain: string): void {
	const index = DOMAIN_REPLACEMENTS.findIndex((r) => r.originalDomain === originalDomain)
	if (index >= 0) {
		DOMAIN_REPLACEMENTS.splice(index, 1)
	}
}

/**
 * Gets all current domain replacement rules
 * @returns Array of current domain replacement rules
 */
export function getDomainReplacements(): DomainReplacement[] {
	return [...DOMAIN_REPLACEMENTS]
}
