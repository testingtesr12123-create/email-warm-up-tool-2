import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailAccounts } from '@/db/schema';
import { eq, like } from 'drizzle-orm';

function validateBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return false;
  }
  
  const token = parts[1];
  return token.length > 0;
}

export async function GET(request) {
  try {
    if (!validateBearerToken(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing authorization token', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select({
      id: emailAccounts.id,
      email: emailAccounts.email,
      provider: emailAccounts.provider,
      smtpHost: emailAccounts.smtpHost,
      smtpPort: emailAccounts.smtpPort,
      smtpSecure: emailAccounts.smtpSecure,
      imapHost: emailAccounts.imapHost,
      imapPort: emailAccounts.imapPort,
      username: emailAccounts.username,
      status: emailAccounts.status,
      warmupStatus: emailAccounts.warmupStatus,
      warmupDay: emailAccounts.warmupDay,
      dailyLimit: emailAccounts.dailyLimit,
      createdAt: emailAccounts.createdAt,
      updatedAt: emailAccounts.updatedAt,
    }).from(emailAccounts);

    if (search) {
      query = query.where(like(emailAccounts.email, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    if (!validateBearerToken(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing authorization token', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      return NextResponse.json(
        { error: 'Valid positive integer ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingAccount = await db.select()
      .from(emailAccounts)
      .where(eq(emailAccounts.id, parsedId))
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json(
        { error: 'Email account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    await db.delete(emailAccounts)
      .where(eq(emailAccounts.id, parsedId));

    return NextResponse.json(
      { message: 'Email account deleted successfully', id: parsedId },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
