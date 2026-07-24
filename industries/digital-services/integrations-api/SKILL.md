---
name: digital-services-integrations-api
description: 'How to troubleshoot integrations, API keys, and webhooks. Uses docs and error details without inventing endpoints or credentials.'
---

# Digital Services -- Integrations and API

## When to use

The customer is connecting a third-party tool, rotating API keys, debugging webhooks, hitting rate limits, or getting integration auth errors.

## Procedure

### 1. Identify the integration surface

Native connector, OAuth app, API key, webhook, SCIM, or custom script. Pull the matching setup guide from the knowledge base.

### 2. Collect safe diagnostics

Ask for error messages, HTTP status codes, approximate timestamps, and which environment (prod vs sandbox). Never ask for secret values to be pasted in full if avoidable. Prefer redacted keys.

### 3. Work the checklist

Common documented causes: wrong environment, expired token, missing scopes, IP allowlist, webhook URL unreachable, signature verification mismatch, rate limit.

### 4. Rate limits and quotas

Explain current limits from the knowledge base. Suggest backoff or plan upgrade only if documented.

### 5. Escalate when stuck

If docs are followed and errors persist, open an engineering ticket with logs and reproduction details. Do not invent fixes.

## What not to do

- Do not invent API endpoints, payloads, or auth schemes.
- Do not store or request third-party passwords.
- Do not disable security checks as a workaround.
- Do not promise unlimited API access.
