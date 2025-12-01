import { NextResponse } from 'next/server';
import { db } from '@/db';
import { warmupSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Authentication middleware
function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header is required', code: 'MISSING_AUTH_HEADER' },
      { status: 401 }
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return NextResponse.json(
      { error: 'Invalid authorization format. Expected: Bearer <token>', code: 'INVALID_AUTH_FORMAT' },
      { status: 401 }
    );
  }

  return null;
}

export async function GET(request, context) {
  try {
    // Check authentication
    const authError = checkAuth(request);
    if (authError) return authError;

    const { id } = context.params;

    // Validate ID parameter
    const emailAccountId = parseInt(id);
    if (!id || isNaN(emailAccountId) || emailAccountId <= 0) {
      return NextResponse.json(
        { error: 'Valid email account ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Fetch warmup settings by emailAccountId
    const settings = await db
      .select()
      .from(warmupSettings)
      .where(eq(warmupSettings.emailAccountId, emailAccountId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Warmup settings not found for this email account', code: 'SETTINGS_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings[0], { status: 200 });
  } catch (error) {
    console.error('GET warmup settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    // Check authentication
    const authError = checkAuth(request);
    if (authError) return authError;

    const { id } = context.params;

    // Validate ID parameter
    const emailAccountId = parseInt(id);
    if (!id || isNaN(emailAccountId) || emailAccountId <= 0) {
      return NextResponse.json(
        { error: 'Valid email account ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      enabled,
      dailyLimit,
      enableReplies,
      enableOpens,
      enableMarkImportant,
      pauseWeekends,
      rampUpDays
    } = body;

    // Validation
    if (dailyLimit !== undefined) {
      const limit = parseInt(dailyLimit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return NextResponse.json(
          { error: 'Daily limit must be between 1 and 100', code: 'INVALID_DAILY_LIMIT' },
          { status: 400 }
        );
      }
    }

    if (rampUpDays !== undefined) {
      const days = parseInt(rampUpDays);
      if (isNaN(days) || days < 1 || days > 30) {
        return NextResponse.json(
          { error: 'Ramp up days must be between 1 and 30', code: 'INVALID_RAMP_UP_DAYS' },
          { status: 400 }
        );
      }
    }

    // Check if settings exist
    const existingSettings = await db
      .select()
      .from(warmupSettings)
      .where(eq(warmupSettings.emailAccountId, emailAccountId))
      .limit(1);

    const timestamp = Date.now();

    if (existingSettings.length === 0) {
      // Create new settings with provided values and defaults
      const newSettings = await db
        .insert(warmupSettings)
        .values({
          emailAccountId,
          enabled: enabled !== undefined ? (enabled ? 1 : 0) : 1,
          dailyLimit: dailyLimit !== undefined ? parseInt(dailyLimit) : 30,
          enableReplies: enableReplies !== undefined ? (enableReplies ? 1 : 0) : 1,
          enableOpens: enableOpens !== undefined ? (enableOpens ? 1 : 0) : 1,
          enableMarkImportant: enableMarkImportant !== undefined ? (enableMarkImportant ? 1 : 0) : 1,
          pauseWeekends: pauseWeekends !== undefined ? (pauseWeekends ? 1 : 0) : 0,
          rampUpDays: rampUpDays !== undefined ? parseInt(rampUpDays) : 15,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();

      return NextResponse.json(newSettings[0], { status: 200 });
    } else {
      // Update existing settings
      const updateData = {
        updatedAt: timestamp
      };

      if (enabled !== undefined) {
        updateData.enabled = enabled ? 1 : 0;
      }
      if (dailyLimit !== undefined) {
        updateData.dailyLimit = parseInt(dailyLimit);
      }
      if (enableReplies !== undefined) {
        updateData.enableReplies = enableReplies ? 1 : 0;
      }
      if (enableOpens !== undefined) {
        updateData.enableOpens = enableOpens ? 1 : 0;
      }
      if (enableMarkImportant !== undefined) {
        updateData.enableMarkImportant = enableMarkImportant ? 1 : 0;
      }
      if (pauseWeekends !== undefined) {
        updateData.pauseWeekends = pauseWeekends ? 1 : 0;
      }
      if (rampUpDays !== undefined) {
        updateData.rampUpDays = parseInt(rampUpDays);
      }

      const updatedSettings = await db
        .update(warmupSettings)
        .set(updateData)
        .where(eq(warmupSettings.emailAccountId, emailAccountId))
        .returning();

      return NextResponse.json(updatedSettings[0], { status: 200 });
    }
  } catch (error) {
    console.error('PUT warmup settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
