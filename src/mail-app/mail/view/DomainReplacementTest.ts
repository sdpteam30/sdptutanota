/**
 * Test file to demonstrate domain replacement functionality
 */

import { replaceEmailDomain, addDomainReplacement, getDomainReplacements } from "./DomainReplacementUtils.js"
import { getMailAddressDisplayTextWithDomainReplacement } from "./MailAddressDisplayUtils.js"

// Test the domain replacement functionality
console.log("Testing Domain Replacement Functionality")
console.log("========================================")

// Test basic domain replacement
const testEmail1 = "citytrust@tutamail.com"
const replacedEmail1 = replaceEmailDomain(testEmail1)
console.log(`Original: ${testEmail1}`)
console.log(`Replaced: ${replacedEmail1}`)
console.log("")

// Test with different email
const testEmail2 = "user@example.com"
const replacedEmail2 = replaceEmailDomain(testEmail2)
console.log(`Original: ${testEmail2}`)
console.log(`Replaced: ${replacedEmail2}`)
console.log("")

// Test mail address display with domain replacement
const testMailAddress = { name: "City Trust", address: "citytrust@tutamail.com" }
const displayText = getMailAddressDisplayTextWithDomainReplacement(testMailAddress.name, testMailAddress.address, false)
console.log(`Mail Address Display: ${displayText}`)
console.log("")

// Test adding a new domain replacement
console.log("Adding new domain replacement...")
addDomainReplacement("example.com", "replaced.com")
console.log("Current domain replacements:")
getDomainReplacements().forEach((replacement) => {
	console.log(`  ${replacement.originalDomain} -> ${replacement.replacementDomain}`)
})
console.log("")

// Test the new replacement
const testEmail3 = "test@example.com"
const replacedEmail3 = replaceEmailDomain(testEmail3)
console.log(`Original: ${testEmail3}`)
console.log(`Replaced: ${replacedEmail3}`)
console.log("")

console.log("Domain replacement test completed!")
