# Next Steps to Bring S Safety Online to a Working V1 MVP

This roadmap outlines the phased development plan to deliver a minimum viable product (V1) of the S Safety Online application. V1 focuses on core AI-powered email safety analysis via a simple paste input method, with color-coded verdicts and basic actions, targeting accessibility for seniors. Monetization begins with basic tier limits.

## Phase 0: Design-First Usability Planning (1 week)
- Conduct user research workshops with seniors to understand preferences, pain points, and digital literacy levels.
- Create wireframes and prototypes emphasizing extreme simplicity (large, clear buttons; minimal steps; intuitive icons).
- Define IA (information architecture) for multi-channel submissions and results, ensuring friction-free flow.
- Test early sketches/maturity with seniors for feedback; iterate to make the app "SO EASY to use" (design forward, prioritizing UX over tech features initially).
- Align designs with WCAG AAA standards and a11y tools integration.

## Phase 1: Core AI Analysis and Basic UI (2-3 weeks, post-design approval)

### 1. Set up OpenAI Integration
   - Configure environment variables for OpenAI API key in Vercel and local `.env.local`.
   - Create a helper function to classify input text using GPT-4 with prompt engineering for verdict categories (red, orange, yellow, green) and actions.
   - Implement error handling for API calls (rate limits, token limits).

### 2. Build Backend API Route
   - Implement `/api/analyze` route (src/app/api/analyze/route.ts) to handle POST requests with text payload.
   - Validate input (max 10,000 characters, required).
   - Integrate OpenAI call and return JSON response: { verdict: 'DANGER|SUSPICIOUS|RISKY|SAFE', explanation: string, actions: string[] }.
   - Add logging for requests (no content storage yet).

### 3. Implement Submission UI (Paste Input Channel)
   - Update `src/app/page.tsx` to include a large textarea for paste input, submit button, and loading state.
   - Use Chakra UI components: Textarea, Button, Box, Spinner.
   - Add form validation and accessibility features (ARIA labels, high contrast).

### 4. Display Verdict Results
   - Create a result component with color-coded cards (red for danger, etc.) using Chakra's Box/Button with conditional styling.
   - Show plain-language explanation and channel-matched actions.
   - Include read-aloud functionality via browser SpeechSynthesis API.

### 5. Basic Request Tracking for Freemium
   - Track request count per IP/device (no account yet) using a simple cache or local storage.
   - Display usage meter and hard limit at 5 requests.

## Phase 2: Multimedia Channels and Enhancements (1-2 weeks)

### 6. Add File Upload Channel
   - Extend submission UI for file/photo upload (PDF, TXT, images).
   - Use Next.js file handling and OCR library (e.g., Tesseract.js for images) to extract text.
   - Integrate with existing analyze route.

### 7. Integrate Voice-to-Text Channel
   - Add microphone button using Web Speech API.
   - Transcribe audio to text and submit to analysis.
   - Handle permissions and browser compatibility.

### 8. Email Forwarding (Keyword-Based)
   - Set up basic email webhook (Mailgun free tier) to receive forwarded emails.
   - Parse email body and submit to analysis (no advanced parsing yet).

### 9. Enhance Accessibility and Design
   - Ensure WCAG compliance with Chakra: increase button sizes, read-aloud buttons, error messages.
   - Add dark mode toggle if time allows.
   - Customize theme for senior-friendly design (larger fonts, simple icons).

## Phase 3: Lifeline Support, Database, and Payments (2-4 weeks)

### 10. Set Up Database (Supabase)
    - Initialize Supabase project and connect via `@supabase/supabase-js`.
    - Create tables: users, trusted_contacts, user_requests, payment_tiers.
    - Migrate from IP-based to user-based tracking with optional accounts.

### 11. Implement Lifeline Management
    - Add UI for managing trusted contacts (add phone/email with consent).
    - For orange/yellow verdicts, add "Ask for Help" buttons to share verdict via SMS/email using Twilio/SendGrid.
    - Store contacts securely (only for logged-in users).

### 12. Integrate Payment Tiers with Stripe
    - Set up Stripe account and subscription products (basic, plus, lifetime).
    - Create payment page to upgrade tiers.
    - Enforce feature gates: higher request quotas, lifeline access.

### 13. Add Dial a Nephew (Text/Phone Escalation)
    - Integrate Twilio for text chat escalation (tier-based).
    - Add Zoho/BuddyCRM or similar for human support queue if outsourced.
    - Temporary: simulate with auto-responses until live support is arranged.

## Phase 4: Testing, Deployment, and Iteration (1-2 weeks)

### 14. Unit and Integration Testing
    - Use Jest/Testing Library for components and API routes.
    - Test AI verdicts with mock data, accessibility with axe-core.

### 15. Deploy to Vercel
    - Configure environment variables and domain.
    - Set up CI/CD with GitHub for auto-deploy.
    - Monitor with Vercel Analytics.

### 16. Beta Launch and Feedback
    - Test with early users (simulate seniors).
    - Gather feedback on UI, AI accuracy, and add/improve features.
    - Refine freemium limits based on usage data.

## Success Metrics for V1
- Users can paste emails and receive accurate verdicts with actions.
- Freemium users hit quota and upgrade via Stripe.
- Orange/yellow results allow lifeline sharing and real-time help via text/phone.
- App loads under 2 seconds, accessible on mobile/desktop.

## Total Estimated Timeline: 6-10 weeks (Varies based on team experience and external integrations)

This plan builds incrementally, starting with V1 MVP focused on core value (safe analysis), then expanding channels and advanced features. Prioritize accessibility and privacy in all steps.
