# Domain Replacement Feature

This feature allows you to replace specific domains in email addresses when they are displayed in the email application. For example, you can replace `citytrust@tutamail.com` with `citytrust@citytrust.com` in the sender display.

## Files Added

1. **DomainReplacementUtils.ts** - Core utility functions for domain replacement
2. **MailAddressDisplayUtils.ts** - Enhanced mail address display functions with domain replacement
3. **DomainReplacementConfig.ts** - Configuration file for managing domain replacement rules
4. **DomainReplacementTest.ts** - Test file to demonstrate functionality

## Files Modified

1. **CollapsedMailView.ts** - Updated to use domain replacement in sender display
2. **MailViewerHeader.ts** - Updated to use domain replacement in sender display
3. **MailViewerUtils.ts** - Updated to use domain replacement in recipient and sender display

## How to Use

### Basic Usage

The domain replacement is automatically applied when email addresses are displayed. The current configuration replaces:
- `tutamail.com` → `citytrust.com`

### Adding New Domain Replacements

To add new domain replacement rules, modify the `DomainReplacementConfig.ts` file:

```typescript
// Add your domain replacement rules here
addDomainReplacement("tutamail.com", "citytrust.com")
addDomainReplacement("olddomain.com", "newdomain.com")
addDomainReplacement("anotherdomain.org", "replacement.org")
```

### Programmatic Usage

You can also add domain replacements programmatically:

```typescript
import { addDomainReplacement, removeDomainReplacement } from "./DomainReplacementUtils.js"

// Add a new replacement
addDomainReplacement("example.com", "replaced.com")

// Remove a replacement
removeDomainReplacement("example.com")
```

### Testing

Run the test file to see the domain replacement in action:

```typescript
import "./DomainReplacementTest.js"
```

## How It Works

1. **DomainReplacementUtils.ts** provides the core functionality:
   - `replaceEmailDomain()` - Replaces domains in email addresses
   - `replaceMailAddressDomain()` - Replaces domains in mail address objects
   - `addDomainReplacement()` - Adds new replacement rules
   - `removeDomainReplacement()` - Removes replacement rules

2. **MailAddressDisplayUtils.ts** provides enhanced display functions:
   - `getMailAddressDisplayTextWithDomainReplacement()` - Enhanced version of the original function
   - `getDisplayedSenderWithDomainReplacement()` - Enhanced sender display
   - `getSenderOrRecipientHeadingWithDomainReplacement()` - Enhanced heading display

3. The modified view files now use these enhanced functions instead of the original ones.

## Configuration

The domain replacement rules are configured in `DomainReplacementConfig.ts`. To add new rules:

1. Open `DomainReplacementConfig.ts`
2. Add new `addDomainReplacement()` calls in the `initializeDomainReplacements()` function
3. The changes will take effect immediately

## Example

If you have an email from `citytrust@tutamail.com`, it will be displayed as `citytrust@citytrust.com` in:
- The collapsed mail view
- The mail viewer header
- The sender information in mail lists
- Any other place where sender information is displayed

## Notes

- The domain replacement only affects the display of email addresses, not the actual email data
- The replacement is applied consistently across all views
- You can add multiple domain replacement rules
- The replacement is case-sensitive for the domain part
