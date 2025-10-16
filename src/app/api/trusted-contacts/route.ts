import { NextRequest, NextResponse } from 'next/server';
import { trustedContactsManager, authManager } from '@/lib/auth';
import { TrustedContact } from '@/lib/ai/types';

// GET /api/trusted-contacts - Get user's trusted contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const user = await authManager.getCurrentUser();
    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get trusted contacts
    const result = await trustedContactsManager.getTrustedContacts(userId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to get trusted contacts',
          details: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: result.contacts || []
    });

  } catch (error) {
    console.error('Get trusted contacts error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/trusted-contacts - Add new trusted contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, phone, email, relationship } = body;

    // Validate input
    if (!userId || !name || !relationship) {
      return NextResponse.json(
        { error: 'User ID, name, and relationship are required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const user = await authManager.getCurrentUser();
    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate relationship
    const validRelationships = ['spouse', 'parent', 'child', 'sibling', 'friend', 'other'];
    if (!validRelationships.includes(relationship.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid relationship type' },
        { status: 400 }
      );
    }

    // Validate phone or email is provided
    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Either phone number or email must be provided' },
        { status: 400 }
      );
    }

    // Add trusted contact
    const contactData = {
      name,
      phone,
      email,
      relationship: relationship.toLowerCase()
    };

    const result = await trustedContactsManager.addTrustedContact(userId, contactData);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to add trusted contact',
          details: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trusted contact added successfully'
    });

  } catch (error) {
    console.error('Add trusted contact error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
