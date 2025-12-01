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
          error: 'Authentication required. Please provide a valid Bearer token.',
          code: 'MISSING_AUTHORIZATION' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Invalid authorization token format.',
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Extract and validate ID
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

    // Update warmup status to paused
    const updated = await db.update(emailAccounts)
      .set({
        warmupStatus: 'paused',
        updatedAt: Date.now()
      })
      .where(eq(emailAccounts.id, accountId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update account',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Warm-up paused successfully',
      account: updated[0],
      warmupStatus: 'paused'
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/warmup/pause/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
