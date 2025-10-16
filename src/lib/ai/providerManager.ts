import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { LMStudioProvider, LMStudioConfig } from './providers/lmstudio';

export type ProviderType = 'openai' | 'lmstudio';

export interface ProviderConfig {
  type: ProviderType;
  openai?: {
    apiKey?: string;
  };
  lmstudio?: LMStudioConfig;
}

export class ProviderManager {
  private currentProvider: AIProvider | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.currentProvider = this.createProvider(config);
  }

  private createProvider(config: ProviderConfig): AIProvider | null {
    switch (config.type) {
      case 'openai':
        // Use provided API key or environment variable
        const apiKey = config.openai?.apiKey || process.env.OPENAI_API_KEY;
        if (apiKey && apiKey.length > 0) {
          return new OpenAIProvider();
        }
        console.warn('OpenAI API key not configured - provider will not be available');
        return null;

      case 'lmstudio':
        if (config.lmstudio) {
          return new LMStudioProvider(config.lmstudio);
        }
        console.warn('LM Studio configuration not provided - provider will not be available');
        return null;

      default:
        console.warn(`Unknown provider type: ${config.type}`);
        return null;
    }
  }

  getProvider(): AIProvider | null {
    return this.currentProvider;
  }

  getProviderName(): string {
    return this.currentProvider?.getProviderName() || 'No Provider';
  }

  isConfigured(): boolean {
    return this.currentProvider?.isConfigured() || false;
  }

  // Switch provider dynamically
  switchProvider(newConfig: ProviderConfig): boolean {
    try {
      const newProvider = this.createProvider(newConfig);
      if (newProvider) {
        this.currentProvider = newProvider;
        this.config = newConfig;
        console.log(`Switched to provider: ${this.getProviderName()}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error switching provider:', error);
      return false;
    }
  }

  // Update LM Studio configuration (useful for runtime changes)
  updateLMStudioConfig(newConfig: Partial<LMStudioConfig>): boolean {
    if (this.config.type === 'lmstudio' && this.currentProvider instanceof LMStudioProvider) {
      this.currentProvider.updateConfig(newConfig);
      if (this.config.lmstudio) {
        this.config.lmstudio = { ...this.config.lmstudio, ...newConfig };
      }
      return true;
    }
    return false;
  }

  // Test provider connectivity
  async testConnection(): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    if (!this.currentProvider) {
      return { success: false, error: 'No provider configured' };
    }

    const startTime = Date.now();

    try {
      // Simple test with minimal data
      const testEmailData = {
        rawText: 'Test message',
        body: 'Test message'
      };

      const response = await this.currentProvider.analyzeEmail(testEmailData);

      return {
        success: response.success,
        error: response.error,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }
}

// Factory function for easy provider creation
export function createProvider(config: ProviderConfig): ProviderManager {
  return new ProviderManager(config);
}

// Default configurations
export const DEFAULT_CONFIGS = {
  openai: {
    type: 'openai' as ProviderType,
    openai: {
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },
  lmstudio: {
    type: 'lmstudio' as ProviderType,
    lmstudio: {
      baseUrl: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234',
      model: process.env.LM_STUDIO_MODEL || 'meta-llama-3-8b-instruct',
      temperature: 0.3,
      maxTokens: 1000
    } as LMStudioConfig
  }
};
