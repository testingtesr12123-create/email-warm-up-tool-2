import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_PROVIDERS = ['gmail', 'outlook', 'custom'];

export async function POST(request) {
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

    // Parse request body
    const body = await request.json();
    const {
      email,
      provider,
      smtp_host,
      smtp_port,
      smtp_secure,
      imap_host,
      imap_port,
      username,
      password,
      daily_limit,
    } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required', code: 'MISSING_PROVIDER' },
        { status: 400 }
      );
    }

    if (!smtp_host) {
      return NextResponse.json(
        { error: 'SMTP host is required', code: 'MISSING_SMTP_HOST' },
        { status: 400 }
      );
    }

    if (smtp_port === undefined || smtp_port === null) {
      return NextResponse.json(
        { error: 'SMTP port is required', code: 'MISSING_SMTP_PORT' },
        { status: 400 }
      );
    }

    if (smtp_secure === undefined || smtp_secure === null) {
      return NextResponse.json(
        { error: 'SMTP secure setting is required', code: 'MISSING_SMTP_SECURE' },
        { status: 400 }
      );
    }

    if (!imap_host) {
      return NextResponse.json(
        { error: 'IMAP host is required', code: 'MISSING_IMAP_HOST' },
        { status: 400 }
      );
    }

    if (imap_port === undefined || imap_port === null) {
      return NextResponse.json(
        { error: 'IMAP port is required', code: 'MISSING_IMAP_PORT' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required', code: 'MISSING_USERNAME' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: 'Provider must be one of: gmail, outlook, custom', code: 'INVALID_PROVIDER' },
        { status: 400 }
      );
    }

    // Validate SMTP port
    const smtpPortNumber = parseInt(smtp_port);
    if (isNaN(smtpPortNumber) || smtpPortNumber <= 0) {
      return NextResponse.json(
        { error: 'SMTP port must be a positive integer', code: 'INVALID_SMTP_PORT' },
        { status: 400 }
      );
    }

    // Validate IMAP port
    const imapPortNumber = parseInt(imap_port);
    if (isNaN(imapPortNumber) || imapPortNumber <= 0) {
      return NextResponse.json(
        { error: 'IMAP port must be a positive integer', code: 'INVALID_IMAP_PORT' },
        { status: 400 }
      );
    }

    // Validate daily_limit if provided
    let dailyLimitValue = 30;
    if (daily_limit !== undefined && daily_limit !== null) {
      const dailyLimitNumber = parseInt(daily_limit);
      if (isNaN(dailyLimitNumber) || dailyLimitNumber < 1 || dailyLimitNumber > 100) {
        return NextResponse.json(
          { error: 'Daily limit must be between 1 and 100', code: 'INVALID_DAILY_LIMIT' },
          { status: 400 }
        );
      }
      dailyLimitValue = dailyLimitNumber;
    }

    // Check if email already exists
    const existingAccount = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.email, email.trim()))
      .limit(1);

    if (existingAccount.length > 0) {
      return NextResponse.json(
        { error: 'Email account already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Encrypt password (basic encryption for now)
    const encryptedPassword = `enc_${password}`;

    // Generate timestamps
    const now = Date.now();

    // Insert new email account
    const newAccount = await db
      .insert(emailAccounts)
      .values({
        email: email.trim(),
        provider: provider,
        smtpHost: smtp_host.trim(),
        smtpPort: smtpPortNumber,
        smtpSecure: Boolean(smtp_secure),
        imapHost: imap_host.trim(),
        imapPort: imapPortNumber,
        username: username.trim(),
        passwordEncrypted: encryptedPassword,
        status: 'active',
        warmupStatus: 'not_started',
        warmupDay: 0,
        dailyLimit: dailyLimitValue,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Remove password from response
    const { passwordEncrypted, ...accountWithoutPassword } = newAccount[0];

    return NextResponse.json(accountWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
