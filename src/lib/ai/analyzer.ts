import { EmailData, AIAnalysisResponse, AnalysisResult, AIProvider } from './types';
import { ProviderManager, ProviderConfig, DEFAULT_CONFIGS } from './providerManager';

// Main analyzer class that coordinates AI analysis
export class EmailAnalyzer {
  private providerManager: ProviderManager;

  constructor(providerConfig?: ProviderConfig) {
    // Default to OpenAI if API key is available, otherwise LM Studio
    const config = providerConfig || this.getDefaultConfig();
    this.providerManager = new ProviderManager(config);
  }

  private getDefaultConfig(): ProviderConfig {
    // Use OpenAI if API key is available, otherwise use LM Studio
    if (process.env.OPENAI_API_KEY) {
      return DEFAULT_CONFIGS.openai;
    }
    return DEFAULT_CONFIGS.lmstudio;
  }

  async analyzeEmail(emailData: EmailData, trustedContacts?: string[]): Promise<AIAnalysisResponse> {
    // Basic validation
    if (!emailData.rawText || emailData.rawText.trim().length === 0) {
      return {
        success: false,
        error: 'Email content is required for analysis'
      };
    }

    // Limit input size to prevent excessive API costs
    if (emailData.rawText.length > 10000) {
      return {
        success: false,
        error: 'Email content is too long. Please limit to 10,000 characters.'
      };
    }

    try {
      // Get the current provider and use it for analysis
      const provider = this.providerManager.getProvider();
      if (!provider) {
        return {
          success: false,
          error: 'No AI provider configured'
        };
      }

      // Use the configured AI provider with trusted contacts
      const response = await provider.analyzeEmail(emailData, trustedContacts);

      // Log analysis for monitoring (in production, use proper logging service)
      console.log(`Analysis completed: ${response.success ? 'SUCCESS' : 'FAILED'}`);
      if (response.processingTime) {
        console.log(`Processing time: ${response.processingTime}ms`);
      }

      return response;

    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during analysis'
      };
    }
  }

  // Get information about the current AI provider
  getProviderInfo() {
    return {
      name: this.providerManager.getProviderName(),
      configured: this.providerManager.isConfigured()
    };
  }

  // Method to switch providers (for future extensibility)
  switchProvider(config: ProviderConfig): boolean {
    return this.providerManager.switchProvider(config);
  }

  // Get the provider manager for advanced operations
  getProviderManager(): ProviderManager {
    return this.providerManager;
  }
}

// Email parsing utilities
export class EmailParser {
  static parseRawEmail(rawText: string): EmailData {
    const lines = rawText.split('\n');
    let senderEmail = '';
    let senderName = '';
    let subject = '';
    let body = '';

    let inBody = false;
    let bodyStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.toLowerCase().startsWith('from:')) {
        const fromMatch = line.match(/from:\s*(.+?)\s*<(.+?)>/i) ||
                         line.match(/from:\s*(.+)/i);
        if (fromMatch) {
          senderName = fromMatch[1]?.trim() || '';
          senderEmail = fromMatch[2]?.trim() || fromMatch[1]?.trim() || '';
        }
      } else if (line.toLowerCase().startsWith('subject:')) {
        subject = line.substring(8).trim();
      } else if (line.toLowerCase() === 'body:' || line === '') {
        if (!inBody && line.toLowerCase() === 'body:') {
          inBody = true;
          bodyStartIndex = i + 1;
        } else if (line === '' && !inBody) {
          inBody = true;
          bodyStartIndex = i + 1;
        }
      }
    }

    // Extract body content
    if (bodyStartIndex >= 0 && bodyStartIndex < lines.length) {
      body = lines.slice(bodyStartIndex).join('\n').trim();
    }

    // If no clear parsing, treat entire text as body
    if (!senderEmail && !subject && !body) {
      body = rawText;
    }

    return {
      rawText,
      senderEmail,
      senderName,
      subject,
      body
    };
  }

  static extractSuspiciousPatterns(emailData: EmailData): string[] {
    const patterns: string[] = [];
    const content = emailData.rawText.toLowerCase();

    // Check for sender/name mismatch
    if (emailData.senderEmail && emailData.senderName) {
      const emailDomain = emailData.senderEmail.split('@')[1]?.toLowerCase();
      const nameLower = emailData.senderName.toLowerCase();

      // Common mismatch patterns
      if (emailDomain && !nameLower.includes(emailDomain.split('.')[0])) {
        patterns.push('Sender name does not match email domain');
      }
    }

    // Urgent language patterns
    const urgentWords = ['urgent', 'immediate', 'act now', 'deadline', 'expires', 'limited time'];
    urgentWords.forEach(word => {
      if (content.includes(word)) {
        patterns.push(`Contains urgent language: "${word}"`);
      }
    });

    // Financial request patterns
    const financialWords = ['payment', 'money', 'bank', 'account', 'wire transfer', 'gift card'];
    financialWords.forEach(word => {
      if (content.includes(word)) {
        patterns.push(`Requests related to: "${word}"`);
      }
    });

    // Suspicious link patterns
    if (content.includes('http') && (content.includes('bit.ly') || content.includes('tinyurl'))) {
      patterns.push('Contains shortened links that may hide the true destination');
    }

    return patterns;
  }
}

// Singleton instance for easy importing
export const emailAnalyzer = new EmailAnalyzer();
export const emailParser = EmailParser;
