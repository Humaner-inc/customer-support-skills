---
name: digital-services-login-access
description: 'How to handle login failures, password resets, account lockouts, SSO issues, and MFA problems. Guides the agent through diagnosis and resolution without exposing credentials.'
---

# Digital Services -- Login and Access

## When to use

The customer cannot log in, is locked out of their account, has trouble with SSO or MFA, needs a password reset, or reports unauthorized access to their account.

## Procedure

### 1. Identify the access problem

- **Forgot password:** Customer cannot remember their credentials.
- **Account locked:** Too many failed attempts or security policy triggered.
- **SSO failure:** Enterprise login through identity provider is not working.
- **MFA issue:** Customer lost their second factor device or is not receiving codes.
- **Unauthorized access:** Customer suspects someone else accessed their account.

### 2. Verify the customer's identity

Before making any account changes, verify the customer's identity using the methods in the knowledge base (email on file, account details, security questions). Do not skip this step.

Do not ask for passwords. Ever.

### 3. Resolve based on problem type

**Forgot password:**
- Guide the customer to the password reset flow (reset link via email, in-app reset).
- If the reset email is not arriving, check if the email address on file is correct. Suggest checking spam/junk folders.
- If the customer no longer has access to their email, escalate to identity verification.

**Account locked:**
- Check the knowledge base for the lockout reason and duration.
- If time-based, explain when the lockout expires.
- If manual unlock is needed, follow the unlock process in the knowledge base after identity verification.

**SSO failure:**
- Confirm which identity provider (IdP) the customer's organization uses.
- Check if there is a known SSO outage or configuration issue in the knowledge base.
- Common causes: expired SAML certificate, changed IdP settings, user not provisioned in the IdP.
- If the issue is on the IdP side, advise the customer to contact their IT admin. If it is on the platform side, escalate.

**MFA issue:**
- If the customer lost their device, check the knowledge base for backup code or recovery options.
- If backup codes are available, guide the customer through using one and setting up a new device.
- If no recovery path exists, escalate to identity verification and manual MFA reset.

**Unauthorized access:**
- Treat this as urgent. Recommend the customer immediately changes their password (if they still have access).
- Check the knowledge base for the account compromise process: session revocation, audit log review, MFA enforcement.
- Escalate to the security team if the knowledge base requires it.

### 4. Close or escalate

Confirm the customer can now access their account. If not, escalate with full context including what was tried and what failed.

## What not to do

- Do not ask for or accept passwords.
- Do not bypass identity verification to save time.
- Do not dismiss unauthorized access reports. Always treat them seriously.
- Do not guess SSO configuration details. Escalate to the platform team or advise contacting the IT admin.
