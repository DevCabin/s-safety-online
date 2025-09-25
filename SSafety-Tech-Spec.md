# Product Requirements Document (PRD)
**AI Email Safety Checker for Seniors**

---

## Purpose

Provide a straightforward, senior-friendly web tool that analyzes suspicious emails and renders advice, verdicts, and step-by-step safety instructions using AI.

---

## Core Features

- **Multiple Friction-Free Submission Methods**
  - Email forwarding
  - Copy & paste
  - File/photo upload
  - Voice-to-text
  - SMS/text

- **AI-Powered Analysis**
  - Color-coded verdict categories:
    - **Red:** Danger (e.g., delete/mark as spam)
    - **Orange:** Suspicious (e.g., pause, get second opinion)
    - **Yellow:** Risky/Unknown (e.g., use lifeline or “Dial a Nephew”)
    - **Green:** Safe (e.g., keep, stay vigilant)
  - Configurable actions per submission channel

- **Lifeline Support: Trusted Contacts**
  - Users add family/friend contacts
  - Result screens offer “Ask for Help” option in Orange/Yellow

- **Human Escalation: Dial a Nephew**
  - Paid option for live text/chat/phone support with tier-based access
  - Business hour, ETA, and access rules communicated in-app

- **Accessibility**
  - Large fonts, high contrast, read-aloud, screen reader support

- **Privacy & Security**
  - No retention of analyzed content without opt-in
  - Strict GDPR/COPPA compliance

- **Education & Support**
  - Fraud prevention guides
  - Help resources

---

## Monetization & Access Model

- **Freemium:** 5–20 free requests/month
- **Paid Tiers:** More scans, lifeline management, Dial a Nephew access
- **Lifetime Licenses:** Early adopters/beta testers rewarded

---

## User Stories

- Red verdict → user guided to delete/block
- Orange/Yellow → lifeline/“Dial a Nephew” offered for second opinions/help
- Paid users/caregivers manage contacts and get intervention
- Premium “Dial a Nephew” users get human safety help by tier

---

## Friction-Free Design Principles

- Recommendation/action matches submission channel
- Lifeline/human options for uncertainty
- Configurable and adaptable to new threats

---

## Non-Functional Requirements/Success Metrics/Out-of-Scope

_As previously outlined; now includes lifeline/Dial a Nephew as core features._

---

# Technical Specification (Tech Spec)
**AI Email Safety Checker for Seniors**

---

## 1. System Overview

Multi-channel submission web app powered by Next.js, hosted on Vercel, leveraging AI for fast, plain-language safety verdicts. Freemium model, highly accessible, integrates human escalation.

---

## 2. Architecture

- **Frontend:** Next.js, Chakra UI/Material UI
- **Backend/API:** Next.js serverless API (Vercel)
- **AI Service:** OpenAI API; expandable to Huggingface/local endpoints
- **External Services:** Mailgun/SendGrid (emails), Twilio (SMS/voice), Stripe (payments), Vercel Postgres/Supabase (data), S3 (file/image, if needed)

---

## 3. Accepted Content & Channels

| Input Method   | Accepted Formats           | Max Size/Duration | Processed By   | Response Via    |
|---------------|----------------------------|-------------------|---------------|------------------|
| Email Forward | .eml/.msg/text, body       | 10,000 chars      | Parse/AI      | Email reply      |
| Paste         | Text/HTML                  | 10,000 chars      | Direct to AI  | Web UI           |
| File Upload   | .eml/.msg/.jpg/.png        | 5 MB              | Parse/OCR/AI  | Web UI           |
| Voice-to-Text | Browser mic (audio)        | 90 sec            | STT/AI        | Web UI/TTS       |
| SMS           | Text, image                | 1,000 chars/5 MB  | Twilio/OCR/AI | SMS reply        |
| Photo Upload  | Image (.jpg/.png)          | 5 MB              | OCR/AI        | Web UI (mobile)  |

---

## 4. Result Categories & Actions

| Category      | Color    | Channel-Specific Action Example         | Lifeline Option | Human Escalation |
|---------------|----------|----------------------------------------|-----------------|------------------|
| Danger        | Red      | Delete, mark as spam/block (email/sms) | No              | No               |
| Suspicious    | Orange   | Pause, forward to trusted contact      | Yes             | Yes (if tier)    |
| Risky/Unknown | Yellow   | Seek second opinion, “Dial a Nephew”   | Yes             | Yes (if tier)    |
| Safe          | Green    | No issues, stay vigilant               | No              | No               |

- Actions per channel are configurable (admin via JSON file, DB, or CMS).

---

## 5. Lifeline Support

- Users can store phone/emails of trusted contacts.
- Orange/Yellow results prompt “Ask for Help.”
- Safely forwards analysis/content with consent.

---

## 6. “Dial a Nephew” Service

- Tier-based, paid access
  - Basic: text/chat, business hours
  - Plus: callback, extended hours
  - Premium: 24/7 phone priority
- Trigger from result screens for immediate escalation
- ETA, business hours, and service info displayed

---

## 7. Freemium Logic

- Request tracking per device/user
- Paid tiers unlock more requests, lifeline management, human support

---

## 8. Frontend/UI

- Color-coded result cards, plain text explanations
- Large controls, accessible design
- Lifeline management, “Dial a Nephew” buttons per relevant verdicts

---

## 9. Backend/API

- Central config for verdicts/actions
- Secure contact/consent flows for lifeline/human services
- Integration points for Mailgun, Twilio, Stripe, OpenAI

---

## 10. Payments

- Stripe: subscriptions, family bundles, lifetime access

---

## 11. Database

- Vercel Postgres/Supabase: request quotas, trusted contacts, payment status, histories (paid only)

---

## 12. Monitoring & Security

- Vercel Analytics, Sentry for error tracking
- HTTPS everywhere, role-based access, rapid content deletion

---

## 13. Accessibility & Compliance

- WCAG/ADA compliance, a11y-first design and code reviews

---

## 14. Testing

- Unit, integration, and E2E for all submission and escalation flows

---

## 15. Deployment

- Github monorepo, Vercel auto-deploy, environment variables managed in Vercel UI

---

## Appendix: JSON Example for Configurable Results

```
{
  "verdict_actions": [
    {
      "level": "DANGER",
      "color": "red",
      "actions": {
        "email": "Delete and mark as spam.",
        "sms": "Delete, Block sender."
      },
      "lifeline_enabled": false,
      "human_help_enabled": false
    },
    {
      "level": "SUSPICIOUS",
      "color": "orange",
      "actions": {
        "email": "Do not reply. Share with trusted contact or use Dial a Nephew.",
        "sms": "Pause. Ask trusted contact."
      },
      "lifeline_enabled": true,
      "human_help_enabled": true
    },
    {
      "level": "RISKY",
      "color": "yellow",
      "actions": {
        "email": "Proceed only after external check.",
        "sms": "Ask family before acting."
      },
      "lifeline_enabled": true,
      "human_help_enabled": true
    },
    {
      "level": "SAFE",
      "color": "green",
      "actions": {
        "email": "No risk found; stay vigilant.",
        "sms": "Continue as normal."
      },
      "lifeline_enabled": false,
      "human_help_enabled": false
    }
  ]
}
```
```