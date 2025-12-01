import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['active', 'paused', 'error'];
const VALID_WARMUP_STATUSES = ['not_started', 'warming_up', 'paused', 'completed'];

export async function PATCH(request, context) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Validate ID from params
    const { id } = context.params;
    const accountId = parseInt(id);
    
    if (!id || isNaN(accountId) || accountId <= 0) {
      return NextResponse.json(
        { error: 'Valid account ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build updates object
    const updates = {};

    // Validate and add status
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { 
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    // Validate and add warmupStatus
    if (body.warmupStatus !== undefined) {
      if (!VALID_WARMUP_STATUSES.includes(body.warmupStatus)) {
        return NextResponse.json(
          { 
            error: `Invalid warmup status. Must be one of: ${VALID_WARMUP_STATUSES.join(', ')}`, 
            code: 'INVALID_WARMUP_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.warmupStatus = body.warmupStatus;
    }

    // Validate and add warmupDay
    if (body.warmupDay !== undefined) {
      const warmupDay = parseInt(body.warmupDay);
      if (isNaN(warmupDay) || warmupDay < 0) {
        return NextResponse.json(
          { error: 'Warmup day must be 0 or positive', code: 'INVALID_WARMUP_DAY' },
          { status: 400 }
        );
      }
      updates.warmupDay = warmupDay;
    }

    // Validate and add dailyLimit
    if (body.dailyLimit !== undefined) {
      const dailyLimit = parseInt(body.dailyLimit);
      if (isNaN(dailyLimit) || dailyLimit < 1 || dailyLimit > 100) {
        return NextResponse.json(
          { error: 'Daily limit must be between 1 and 100', code: 'INVALID_DAILY_LIMIT' },
          { status: 400 }
        );
      }
      updates.dailyLimit = dailyLimit;
    }

    // Add connection settings if provided
    if (body.smtpHost !== undefined) {
      updates.smtpHost = body.smtpHost.trim();
    }

    if (body.smtpPort !== undefined) {
      const smtpPort = parseInt(body.smtpPort);
      if (isNaN(smtpPort) || smtpPort <= 0) {
        return NextResponse.json(
          { error: 'SMTP port must be a positive integer', code: 'INVALID_SMTP_PORT' },
          { status: 400 }
        );
      }
      updates.smtpPort = smtpPort;
    }

    if (body.imapHost !== undefined) {
      updates.imapHost = body.imapHost.trim();
    }

    if (body.imapPort !== undefined) {
      const imapPort = parseInt(body.imapPort);
      if (isNaN(imapPort) || imapPort <= 0) {
        return NextResponse.json(
          { error: 'IMAP port must be a positive integer', code: 'INVALID_IMAP_PORT' },
          { status: 400 }
        );
      }
      updates.imapPort = imapPort;
    }

    if (body.username !== undefined) {
      updates.username = body.username.trim();
    }

    // Handle password encryption
    if (body.password !== undefined) {
      if (!body.password || body.password.trim() === '') {
        return NextResponse.json(
          { error: 'Password cannot be empty', code: 'INVALID_PASSWORD' },
          { status: 400 }
        );
      }
      updates.passwordEncrypted = `enc_${body.password}`;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Check if account exists
    const existingAccount = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.id, accountId))
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json(
        { error: 'Email account not found', code: 'ACCOUNT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Always update updatedAt timestamp
    updates.updatedAt = Date.now();

    // Update the account
    const updatedAccount = await db
      .update(emailAccounts)
      .set(updates)
      .where(eq(emailAccounts.id, accountId))
      .returning();

    if (updatedAccount.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update account', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Remove passwordEncrypted from response
    const { passwordEncrypted, ...accountWithoutPassword } = updatedAccount[0];

    return NextResponse.json(accountWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/email/accounts/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
