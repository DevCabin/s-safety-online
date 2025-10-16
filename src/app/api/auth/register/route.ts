import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/auth';

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (basic validation)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Attempt registration
    const result = await authManager.signUp(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Registration failed',
          details: result.error
        },
        { status: 400 }
      );
    }

    // Return success (user will need to verify email in production)
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      note: 'In production, implement email verification before allowing login'
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
