import { NextResponse } from 'next/server';
import { db } from '@/db';
import { warmupLogs } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';

export async function GET(request, context) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
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

    // Extract and validate ID from route parameter
    const { id } = context.params;
    const emailAccountId = parseInt(id);
    
    if (!id || isNaN(emailAccountId) || emailAccountId <= 0) {
      return NextResponse.json(
        { 
          error: 'Valid email account ID is required and must be a positive integer.',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const actionType = searchParams.get('action_type');
    const status = searchParams.get('status');

    // Validate and set limit (default 50, max 100)
    let limit = 50;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { 
            error: 'Limit must be a positive integer.',
            code: 'INVALID_LIMIT' 
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100);
    }

    // Validate and set offset (default 0)
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { 
            error: 'Offset must be a non-negative integer.',
            code: 'INVALID_OFFSET' 
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Build where conditions
    const conditions = [eq(warmupLogs.emailAccountId, emailAccountId)];
    
    if (actionType) {
      conditions.push(eq(warmupLogs.actionType, actionType));
    }
    
    if (status) {
      conditions.push(eq(warmupLogs.status, status));
    }

    const whereCondition = conditions.length > 1 
      ? and(...conditions) 
      : conditions[0];

    // Get total count for pagination metadata
    const [{ total }] = await db
      .select({ total: count() })
      .from(warmupLogs)
      .where(whereCondition);

    // Fetch logs with filters, ordering, and pagination
    const logs = await db
      .select()
      .from(warmupLogs)
      .where(whereCondition)
      .orderBy(desc(warmupLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      {
        logs,
        limit,
        offset,
        total
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/warmup/logs/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
