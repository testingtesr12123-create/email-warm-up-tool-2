import { NextResponse } from 'next/server';
import { db } from '@/db';
import { warmupStats } from '@/db/schema';
import { eq, gte, lte, and, asc } from 'drizzle-orm';

export async function GET(request, context) {
  try {
    // Authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authorization token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Extract and validate ID parameter
    const { id } = context.params;
    const emailAccountId = parseInt(id);

    if (!id || isNaN(emailAccountId) || emailAccountId <= 0) {
      return NextResponse.json(
        { error: 'Valid email account ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');

    // Default date range: 30 days ago to today
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let startDate;
    let endDate;

    // Validate and parse start_date
    if (startDateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDateParam)) {
        return NextResponse.json(
          { error: 'Invalid start_date format. Expected YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
      }
      const parsedDate = new Date(startDateParam);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start_date value', code: 'INVALID_DATE_VALUE' },
          { status: 400 }
        );
      }
      startDate = startDateParam;
    } else {
      startDate = formatDate(thirtyDaysAgo);
    }

    // Validate and parse end_date
    if (endDateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(endDateParam)) {
        return NextResponse.json(
          { error: 'Invalid end_date format. Expected YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
      }
      const parsedDate = new Date(endDateParam);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end_date value', code: 'INVALID_DATE_VALUE' },
          { status: 400 }
        );
      }
      endDate = endDateParam;
    } else {
      endDate = formatDate(today);
    }

    // Fetch stats from database
    const stats = await db
      .select()
      .from(warmupStats)
      .where(
        and(
          eq(warmupStats.emailAccountId, emailAccountId),
          gte(warmupStats.date, startDate),
          lte(warmupStats.date, endDate)
        )
      )
      .orderBy(asc(warmupStats.date));

    // Calculate aggregate totals
    let totalSent = 0;
    let totalOpened = 0;
    let totalReplied = 0;
    let totalBounces = 0;
    let totalSpamReports = 0;
    let totalHealthScore = 0;

    stats.forEach(stat => {
      totalSent += stat.emailsSent;
      totalOpened += stat.emailsOpened;
      totalReplied += stat.emailsReplied;
      totalBounces += stat.bounces;
      totalSpamReports += stat.spamReports;
      totalHealthScore += stat.healthScore;
    });

    const averageHealthScore = stats.length > 0 
      ? Math.round(totalHealthScore / stats.length) 
      : 0;

    // Return response
    return NextResponse.json({
      stats,
      summary: {
        totalSent,
        totalOpened,
        totalReplied,
        averageHealthScore,
        totalBounces,
        totalSpamReports
      },
      dateRange: {
        start: startDate,
        end: endDate
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
