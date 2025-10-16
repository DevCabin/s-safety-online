import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/auth';

// POST /api/auth/login - User login
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

    // Attempt login
    const result = await authManager.signIn(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Login failed',
          details: result.error
        },
        { status: 401 }
      );
    }

    // Return success with user session
    return NextResponse.json({
      success: true,
      user: result.session!.user,
      accessToken: result.session!.access_token,
      // Note: In production, don't send refresh token to client
      // Store it securely server-side or use httpOnly cookies
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
