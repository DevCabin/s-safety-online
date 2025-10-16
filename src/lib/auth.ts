import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, TrustedContact, UserSession } from './ai/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client with fallback values for build time
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Warn about missing configuration only in runtime, not build time
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase configuration not found. Authentication features will not be available.');
}

// Authentication functions
export class AuthManager {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        const session: UserSession = {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: data.user.updated_at || new Date().toISOString(),
          },
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };

        return { success: true, session };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (user) {
        return {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }
}

// Trusted Contacts management
export class TrustedContactsManager {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  async addTrustedContact(
    userId: string,
    contact: Omit<TrustedContact, 'id' | 'user_id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('trusted_contacts')
        .insert([
          {
            user_id: userId,
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            relationship: contact.relationship,
          }
        ]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getTrustedContacts(userId: string): Promise<{ success: boolean; contacts?: TrustedContact[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, contacts: data as TrustedContact[] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateTrustedContact(
    contactId: string,
    updates: Partial<Omit<TrustedContact, 'id' | 'user_id' | 'created_at'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('trusted_contacts')
        .update(updates)
        .eq('id', contactId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deleteTrustedContact(contactId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('trusted_contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Singleton instances for easy importing
export const authManager = new AuthManager();
export const trustedContactsManager = new TrustedContactsManager();
