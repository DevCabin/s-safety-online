// Carefully crafted prompts for scam detection analysis
// Designed specifically for senior safety and clear communication

export const SCAM_DETECTION_PROMPT = `You are an expert cybersecurity analyst specializing in protecting seniors from email scams. Analyze the following email content and provide a clear safety assessment.

EMAIL CONTENT:
{emailContent}

ANALYSIS INSTRUCTIONS:
1. Extract key email components (sender, subject, main message)
2. Identify potential scam indicators:
   - Sender name/email mismatch
   - Urgent or threatening language
   - Requests for personal information or money
   - Suspicious links or attachments
   - Promises that seem too good to be true
   - Poor grammar or unusual formatting

3. Evaluate overall risk level and assign ONE of these verdicts:
   - DANGER: Clear scam indicators, immediate action needed
   - SUSPICIOUS: Several concerning elements, caution advised
   - RISKY: Some unusual elements, verify before proceeding
   - SAFE: No apparent risks, normal communication

RESPONSE FORMAT (JSON only):
{
  "verdict": "DANGER|SUSPICIOUS|RISKY|SAFE",
  "confidence": 85,
  "explanation": "Clear explanation in simple language for seniors",
  "riskFactors": ["List specific concerns", "Be specific about what to watch for"],
  "isScam": true/false,
  "actions": [
    {
      "description": "Specific action to take",
      "channelSpecific": "Email-specific instruction if applicable"
    }
  ]
}

IMPORTANT:
- Use simple, clear language appropriate for seniors
- Be specific about risks without causing unnecessary alarm
- Focus on actionable safety steps
- If suspicious but not clearly dangerous, recommend verification steps`;

export const VERDICT_CONFIGURATIONS = {
  DANGER: {
    level: 'DANGER' as const,
    color: 'red' as const,
    actions: {
      email: 'Delete this email immediately and mark as spam. Do not click any links or reply.',
      sms: 'Delete this message and block the sender. Do not respond.',
      general: 'Delete and ignore. This appears to be a scam.'
    },
    requiresHumanHelp: false,
    requiresLifeline: false,
    priority: 1
  },
  SUSPICIOUS: {
    level: 'SUSPICIOUS' as const,
    color: 'orange' as const,
    actions: {
      email: 'Do not reply or click links. Share with a trusted family member for second opinion.',
      sms: 'Pause and ask a family member before responding.',
      general: 'Be cautious. Get a second opinion from someone you trust.'
    },
    requiresHumanHelp: true,
    requiresLifeline: true,
    priority: 2
  },
  RISKY: {
    level: 'RISKY' as const,
    color: 'yellow' as const,
    actions: {
      email: 'Verify with official sources before taking any action requested.',
      sms: 'Double-check with known contacts before proceeding.',
      general: 'Proceed with caution and verify information independently.'
    },
    requiresHumanHelp: true,
    requiresLifeline: true,
    priority: 3
  },
  SAFE: {
    level: 'SAFE' as const,
    color: 'green' as const,
    actions: {
      email: 'No apparent risks. Continue as normal but stay vigilant.',
      sms: 'Normal communication. No special precautions needed.',
      general: 'Appears safe, but maintain good safety habits.'
    },
    requiresHumanHelp: false,
    requiresLifeline: false,
    priority: 4
  }
};

// Helper function to get configuration for a verdict
export function getVerdictConfig(verdict: string) {
  const config = VERDICT_CONFIGURATIONS[verdict as keyof typeof VERDICT_CONFIGURATIONS];
  return config || VERDICT_CONFIGURATIONS.SAFE;
}
