import OpenAI from 'openai';
import {
  AIProvider,
  EmailData,
  AIAnalysisResponse,
  AnalysisResult,
  VerdictAction
} from '../types';
import { SCAM_DETECTION_PROMPT, getVerdictConfig } from '../prompts';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  getProviderName(): string {
    return 'OpenAI GPT-4';
  }

  isConfigured(): boolean {
    return !!(this.client && this.apiKey);
  }

  async analyzeEmail(emailData: EmailData, trustedContacts?: string[]): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    try {
      // Format the email content for analysis
      const emailContent = this.formatEmailContent(emailData);

      // Format trusted contacts for the prompt
      const contactsText = trustedContacts && trustedContacts.length > 0
        ? trustedContacts.map(contact => `- ${contact}`).join('\n')
        : 'No trusted contacts available';

      // Create the prompt with the email content and trusted contacts
      let prompt = SCAM_DETECTION_PROMPT.replace('{emailContent}', emailContent);
      prompt = prompt.replace('{trustedContacts}', contactsText);

      const response = await this.client!.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert focused on protecting seniors from scams. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for consistent analysis
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: 'No response from OpenAI API'
        };
      }

      // Parse the JSON response
      const analysis = JSON.parse(content) as {
        verdict: string;
        confidence: number;
        explanation: string;
        riskFactors: string[];
        isScam: boolean;
        actions: Array<{ description: string; channelSpecific?: string }>;
      };

      // Convert to our internal format
      const result = this.convertToAnalysisResult(analysis);

      return {
        success: true,
        result,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime
      };
    }
  }

  private formatEmailContent(emailData: EmailData): string {
    let content = '';

    if (emailData.senderEmail || emailData.senderName) {
      content += `FROM: ${emailData.senderName || ''} <${emailData.senderEmail || ''}>\n`;
    }

    if (emailData.subject) {
      content += `SUBJECT: ${emailData.subject}\n`;
    }

    content += '\nBODY:\n';
    content += emailData.body || emailData.rawText;

    return content;
  }

  private convertToAnalysisResult(analysis: {
    verdict: string;
    confidence: number;
    explanation: string;
    riskFactors: string[];
    isScam: boolean;
    actions: Array<{ description: string; channelSpecific?: string }>;
  }): AnalysisResult {
    const verdict = analysis.verdict || 'SAFE';
    const config = getVerdictConfig(verdict);

    // Create appropriate actions based on verdict
    const actions: VerdictAction[] = [{
      description: config.actions.general,
      channelSpecific: config.actions.email
    }];

    return {
      verdict: config.level,
      color: config.color,
      confidence: analysis.confidence || 75,
      explanation: analysis.explanation || 'Analysis completed',
      actions,
      riskFactors: analysis.riskFactors || [],
      isScam: analysis.isScam || false
    };
  }
}
