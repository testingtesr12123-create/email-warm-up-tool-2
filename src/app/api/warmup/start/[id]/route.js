import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request, context) {
  try {
    // Authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Missing or invalid authorization token',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Authorization token cannot be empty',
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Extract and validate id from params
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

    // Fetch email account by id
    const account = await db
      .select()
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

    // Check if already warming up
    if (emailAccount.warmupStatus === 'warming_up') {
      return NextResponse.json(
        {
          message: 'Warm-up is already in progress',
          account: emailAccount,
          warmupStatus: 'warming_up'
        },
        { status: 200 }
      );
    }

    // Warn if account status is not active (but allow the operation)
    if (emailAccount.status !== 'active') {
      console.warn(`Starting warmup for account ${accountId} with non-active status: ${emailAccount.status}`);
    }

    // Update warmup status
    const updated = await db
      .update(emailAccounts)
      .set({
        warmupStatus: 'warming_up',
        updatedAt: Date.now()
      })
      .where(eq(emailAccounts.id, accountId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update account warmup status',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Warm-up started successfully',
        account: updated[0],
        warmupStatus: 'warming_up'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/warmup/start/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
