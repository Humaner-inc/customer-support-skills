---
name: digital-services-bug-reports
description: 'How to handle bug reports and technical issues. Guides the agent through reproduction, triage, known-issue matching, and escalation to engineering without guessing at fixes.'
---

# Digital Services -- Bug Reports

## When to use

The customer reports something that is broken, not working as expected, producing an error, or behaving differently than documented.

## Procedure

### 1. Acknowledge and gather context

Thank the customer for reporting the issue. Gather:

- What they were trying to do (the expected behavior).
- What actually happened (the actual behavior).
- When it started happening (first occurrence, ongoing, intermittent).
- Browser, device, or environment details if relevant.
- Error messages or screenshots if available.

### 2. Check for known issues

Search the knowledge base for:

- Known bugs matching the description.
- Ongoing incidents or outages.
- Recent changes or deployments that might be related.

If a known issue matches, share the status with the customer: acknowledged, in progress, resolved, or workaround available. Share the workaround if one exists.

### 3. Attempt to reproduce or narrow down

If the issue is not known, help the customer isolate it:

- Does it happen in a different browser or device?
- Does it happen for other users in the same organization?
- Does it happen with a different data set or configuration?
- Has anything changed recently in their setup (permissions, integrations, settings)?

This information is critical for engineering. Gather it before escalating.

### 4. Offer a workaround if possible

If the knowledge base has a workaround or if the investigation reveals an alternative path, offer it. Be clear that it is a temporary workaround, not a fix.

### 5. Escalate to engineering

If the issue cannot be resolved:

- File a bug report with: steps to reproduce, expected vs. actual behavior, environment details, customer impact, screenshots or error messages.
- Tell the customer the bug has been reported and what to expect next (timeline from the knowledge base, if available).
- Do not promise a fix date unless the knowledge base provides one.

### 6. Follow up

If the knowledge base has a process for follow-up (ticket updates, status page), share it. Set expectations for when the customer will hear back.

## What not to do

- Do not guess at the cause of the bug.
- Do not promise a fix timeline unless it is in the knowledge base.
- Do not tell the customer "it works on my end" as a resolution.
- Do not ask the customer to clear their cache as the first and only suggestion. Gather real context first.
- Do not dismiss intermittent issues. They are often real.
