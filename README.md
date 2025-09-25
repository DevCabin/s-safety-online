# S Safety Online

AI Email Safety Checker for Seniors – Empowering confident digital communication through safe, accessible technology.

## Project Ideals & Purpose

S Safety Online is a senior-friendly web application designed to make online safety intuitive and effortless. Our core mission is to protect vulnerable users from email-based scams and threats by providing:

- **Friction-Free Access**: Multiple input methods (paste, upload, voice) to match user habits across channels (email, SMS, photos).
- **AI-Powered Trust**: Clear, color-coded verdicts (Red: Danger – Green: Safe) with plain-language advice and automatic actions.
- **Human Safety Nets**: Lifeline contacts and "Dial a Nephew" paid human support for uncertain situations.
- **Inclusive Design**: High contrast, large fonts, voice support, and WCAG compliance for all users.
- **Ethical Foundations**: No content retention without opt-in, strict GDPR/COPPA compliance, freemium model with transparent payments.

Built with accessibility-first principles, we prioritize seniors' peace of mind in the digital world.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Chakra UI
- **Backend**: Next.js API Routes, Vercel Serverless
- **AI**: OpenAI GPT-4 for analysis (expandable to local models)
- **Integrations**: Supabase (database), Stripe (payments), Twilio/Mailgun/SendGrid (channels)
- **Deployment**: Vercel with auto-deploy from GitHub

## High-Level Road Map to V1 MVP

### Phase 0: Design-First Usability Planning (1 week)
- Conduct senior user research workshops for extreme simplicity focus ("SO EASY to use").
- Create wireframes/prototypes prioritizing UX (large buttons, intuitive icons, minimal steps).
- Define IA for friction-free multi-channel submissions and results; WCAG AAA alignment.

### Phase 1: Core Analysis & UI (2-3 weeks, post-design approval)
- Integrate OpenAI for verdict classification
- Build `/api/analyze` endpoint and paste-input form
- Display color-coded results with actions and read-aloud

### Phase 2: Multi-Channel Support (1-2 weeks)
- Add file/voice/email submission channels
- Implement OCR for images, speech-to-text
- Enhance accessibility (larger controls, a11y testing)

### Phase 3: Advanced Features (2-4 weeks)
- Set up Supabase database for users/contacts
- Add lifeline sharing and "Dial a Nephew" text escalation
- Integrate Stripe for freemium tiers

### Phase 4: Testing & Launch (1-2 weeks)
- Unit/integration tests, beta feedback
- Deploy to Vercel, monitor with analytics

See `NEXT_STEPS.md` for detailed implementation steps.

## Getting Started (Dev Environment)

1. Clone this repo:
   ```bash
   git clone https://github.com/DevCabin/s-safety-online.git
   cd s-safety-online
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local` locally):
   - `OPENAI_API_KEY` (for AI analysis, add to Vercel too)
   - Future: Supabase URL/Key, Stripe/Twilio keys

4. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Contributing

- Follow the phased roadmap in `NEXT_STEPS.md`
- Ensure WCAG accessibility (try axe DevTools)
- Test with varied email samples (safe, scams, uncertain)
- Use TypeScript strictly, commit meaningful changes

## Contact & Support

For ideation or beta access: Reach out via GitHub issues or the PRD documents (`SSafety-PRD.md`, `SSafety-Tech-Spec.md`).
