import {
  AIProvider,
  EmailData,
  AIAnalysisResponse,
  AnalysisResult,
  VerdictAction
} from '../types';
import { SCAM_DETECTION_PROMPT, getVerdictConfig } from '../prompts';

export interface LMStudioConfig {
  baseUrl: string; // e.g., "https://your-tunnel.cloudflare.com" or "http://localhost:1234"
  model: string;  // e.g., "meta-llama-3-8b-instruct"
  temperature?: number;
  maxTokens?: number;
}

export class LMStudioProvider implements AIProvider {
  private config: LMStudioConfig;
  private isConfiguredFlag: boolean;

  constructor(config: LMStudioConfig) {
    this.config = {
      temperature: 0.3,
      maxTokens: 1000,
      ...config
    };

    // Check if we can reach the LM Studio server
    this.isConfiguredFlag = this.validateConfiguration();
  }

  getProviderName(): string {
    return `LM Studio (${this.config.model})`;
  }

  isConfigured(): boolean {
    return this.isConfiguredFlag;
  }

  private validateConfiguration(): boolean {
    // Basic validation - in production you might want to test the connection
    return !!(this.config.baseUrl && this.config.model);
  }

  async analyzeEmail(emailData: EmailData, trustedContacts?: string[]): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'LM Studio provider not properly configured'
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

      // Make request to LM Studio server
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
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
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `LM Studio API error: ${response.status} ${response.statusText}`,
          processingTime: Date.now() - startTime
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: 'No response content from LM Studio API'
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
      console.error('LM Studio analysis error:', error);
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

  // Update configuration (useful for dynamic provider switching)
  updateConfig(newConfig: Partial<LMStudioConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.isConfiguredFlag = this.validateConfiguration();
  }
}
