import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request, context) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authorization header with Bearer token is required',
          code: 'MISSING_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Invalid authorization token',
          code: 'INVALID_AUTH_TOKEN'
        },
        { status: 401 }
      );
    }

    // Extract and validate ID parameter
    const { id } = context.params;
    const accountId = parseInt(id);

    if (!id || isNaN(accountId) || accountId <= 0) {
      return NextResponse.json(
        { 
          error: 'Valid positive integer ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Fetch email account by ID
    const account = await db.select()
      .from(emailAccounts)
      .where(eq(emailAccounts.id, accountId))
      .limit(1);

    if (account.length === 0) {
      return NextResponse.json(
        { 
          error: 'Email account not found',
          code: 'ACCOUNT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const emailAccount = account[0];

    // Calculate progress metrics
    const progress = Math.min((emailAccount.warmupDay / 15) * 100, 100);
    const isComplete = emailAccount.warmupStatus === 'completed' || emailAccount.warmupDay >= 15;
    const daysRemaining = Math.max(15 - emailAccount.warmupDay, 0);

    // Return detailed status object
    return NextResponse.json({
      email: emailAccount.email,
      warmupStatus: emailAccount.warmupStatus,
      warmupDay: emailAccount.warmupDay,
      dailyLimit: emailAccount.dailyLimit,
      progress: Math.round(progress * 100) / 100,
      isComplete,
      daysRemaining,
      accountStatus: emailAccount.status
    }, { status: 200 });

  } catch (error) {
    console.error('GET warmup status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
