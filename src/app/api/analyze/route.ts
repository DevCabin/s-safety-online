import { NextRequest, NextResponse } from 'next/server';
import { emailAnalyzer, emailParser } from '@/lib/ai/analyzer';
import { authManager, trustedContactsManager } from '@/lib/auth';
import { EmailData } from '@/lib/ai/types';

// POST /api/analyze - Analyze email content for scam detection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailContent, userId } = body;

    // Validate input
    if (!emailContent || typeof emailContent !== 'string') {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    if (emailContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email content cannot be empty' },
        { status: 400 }
      );
    }

    // Parse email content
    const emailData: EmailData = emailParser.parseRawEmail(emailContent);

    // Get user and trusted contacts if userId provided
    let trustedContacts: string[] | undefined;
    if (userId) {
      try {
        // Verify user authentication
        const user = await authManager.getCurrentUser();
        if (!user || user.id !== userId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Get trusted contacts for personalized suggestions
        const contactsResult = await trustedContactsManager.getTrustedContacts(userId);
        if (contactsResult.success && contactsResult.contacts) {
          trustedContacts = contactsResult.contacts.map(contact =>
            `${contact.name} (${contact.relationship})`
          );
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        // Continue without trusted contacts if there's an error
      }
    }

    // Analyze email with AI
    const analysisResult = await emailAnalyzer.analyzeEmail(emailData, trustedContacts);

    if (!analysisResult.success) {
      return NextResponse.json(
        {
          error: 'Analysis failed',
          details: analysisResult.error
        },
        { status: 500 }
      );
    }

    // Get provider info for response
    const providerInfo = emailAnalyzer.getProviderInfo();

    // Return comprehensive analysis result
    return NextResponse.json({
      success: true,
      analysis: {
        verdict: analysisResult.result!.verdict,
        color: analysisResult.result!.color,
        confidence: analysisResult.result!.confidence,
        explanation: analysisResult.result!.explanation,
        actions: analysisResult.result!.actions,
        riskFactors: analysisResult.result!.riskFactors,
        isScam: analysisResult.result!.isScam,
        processingTime: analysisResult.processingTime,
        aiProvider: providerInfo.name,
        emailComponents: {
          senderEmail: emailData.senderEmail,
          senderName: emailData.senderName,
          subject: emailData.subject,
          hasBody: !!emailData.body
        }
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/analyze - Get provider status and configuration
export async function GET() {
  try {
    const providerInfo = emailAnalyzer.getProviderInfo();

    return NextResponse.json({
      success: true,
      provider: {
        name: providerInfo.name,
        configured: providerInfo.configured,
        available: true
      },
      features: {
        authentication: true,
        trustedContacts: true,
        multiProvider: true,
        emailParsing: true
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Status check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
