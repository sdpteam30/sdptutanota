/**
 * Domain Replacement Utilities
 *
 * This module provides utilities for managing email and domain replacements
 * for study purposes. Email replacements take precedence over domain rules.
 */

interface DomainReplacement {
	originalDomain: string
	replacementDomain: string
}

interface EmailReplacement {
	originalEmail: string
	replacementEmail: string
}

// In-memory storage for replacement rules
const domainReplacements: Map<string, string> = new Map()
const emailReplacements: Map<string, string> = new Map()

/**
 * Add a domain replacement rule
 * @param originalDomain The domain to replace (e.g., "tuta.com")
 * @param replacementDomain The replacement domain (e.g., "gmail.com")
 */
export function addDomainReplacement(originalDomain: string, replacementDomain: string): void {
	domainReplacements.set(originalDomain.toLowerCase(), replacementDomain.toLowerCase())
	console.log(`📋 Domain rule added: ${originalDomain} → ${replacementDomain}`)
}

/**
 * Remove a domain replacement rule
 * @param originalDomain The domain to remove from replacements
 */
export function removeDomainReplacement(originalDomain: string): void {
	domainReplacements.delete(originalDomain.toLowerCase())
}

/**
 * Get all domain replacement rules
 * @returns Array of domain replacement rules
 */
export function getDomainReplacements(): DomainReplacement[] {
	return Array.from(domainReplacements.entries()).map(([originalDomain, replacementDomain]) => ({
		originalDomain,
		replacementDomain,
	}))
}

/**
 * Add an exact email replacement rule (takes precedence over domain rules)
 * @param originalEmail The exact email to replace (e.g., "user@tuta.com")
 * @param replacementEmail The replacement email (e.g., "user@gmail.com")
 */
export function addEmailReplacement(originalEmail: string, replacementEmail: string): void {
	emailReplacements.set(originalEmail.toLowerCase(), replacementEmail.toLowerCase())
	console.log(`📋 Email rule added: ${originalEmail} → ${replacementEmail}`)
}

/**
 * Remove an exact email replacement rule
 * @param originalEmail The email to remove from replacements
 */
export function removeEmailReplacement(originalEmail: string): void {
	emailReplacements.delete(originalEmail.toLowerCase())
}

/**
 * Get all email replacement rules
 * @returns Array of email replacement rules
 */
export function getEmailReplacements(): EmailReplacement[] {
	return Array.from(emailReplacements.entries()).map(([originalEmail, replacementEmail]) => ({
		originalEmail,
		replacementEmail,
	}))
}

/**
 * Replace the domain of an email address according to the replacement rules
 * Email replacements take precedence over domain rules
 * @param email - The original email address
 * @returns The email address with replaced domain/email, or the original if no mapping exists
 */
export function replaceDomain(email: string): string {
	if (!email || !email.includes("@")) {
		return email
	}

	const emailLower = email.toLowerCase()

	// First, check for exact email replacement (highest priority)
	const exactReplacement = emailReplacements.get(emailLower)
	if (exactReplacement) {
		console.log(`🔄 Email replacement: ${email} → ${exactReplacement}`)
		return exactReplacement
	}

	// Then check for domain replacement
	const [localPart, originalDomain] = email.split("@")
	const replacementDomain = domainReplacements.get(originalDomain.toLowerCase())

	if (replacementDomain) {
		const replacedEmail = `${localPart}@${replacementDomain}`
		console.log(`🔄 Domain replacement: ${email} → ${replacedEmail}`)
		return replacedEmail
	}

	// No replacement found, return original
	return email
}

/**
 * Replace domains in a MailAddress object
 * @param mailAddress - The mail address object with name and address
 * @returns A new mail address object with replaced domain
 */
export function replaceMailAddressDomain(mailAddress: { name: string; address: string }): { name: string; address: string } {
	return {
		name: mailAddress.name,
		address: replaceDomain(mailAddress.address),
	}
}

/**
 * Clear all replacement rules
 */
export function clearAllReplacements(): void {
	domainReplacements.clear()
	emailReplacements.clear()
	console.log("🗑️ All replacement rules cleared")
}
