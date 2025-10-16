// Core types for the AI analysis system

export type VerdictLevel = 'DANGER' | 'SUSPICIOUS' | 'RISKY' | 'SAFE';

export type VerdictColor = 'red' | 'orange' | 'yellow' | 'green';

export interface EmailData {
  rawText: string;
  senderEmail?: string;
  senderName?: string;
  subject?: string;
  body?: string;
}

export interface VerdictAction {
  description: string;
  channelSpecific?: string;
}

export interface AnalysisResult {
  verdict: VerdictLevel;
  color: VerdictColor;
  confidence: number; // 0-100
  explanation: string;
  actions: VerdictAction[];
  riskFactors: string[];
  isScam: boolean;
}

export interface AIAnalysisResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  processingTime?: number;
}

// AI Provider interface for modularity
export interface AIProvider {
  analyzeEmail(emailData: EmailData, trustedContacts?: string[]): Promise<AIAnalysisResponse>;
  getProviderName(): string;
  isConfigured(): boolean;
}

// Configuration for different verdict levels
export interface VerdictConfig {
  level: VerdictLevel;
  color: VerdictColor;
  actions: {
    email: string;
    sms?: string;
    general: string;
  };
  requiresHumanHelp: boolean;
  requiresLifeline: boolean;
  priority: number;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  relationship: string; // e.g., "daughter", "son", "spouse", "friend"
  created_at: string;
}

export interface UserSession {
  user: User;
  access_token: string;
  refresh_token: string;
}
