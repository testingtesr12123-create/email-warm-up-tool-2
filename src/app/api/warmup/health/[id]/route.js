import { NextResponse } from 'next/server';
import { db } from '@/db';
import { warmupStats, emailAccounts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    // Fetch email account
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

    // Fetch most recent 30 days of stats
    const stats = await db
      .select()
      .from(warmupStats)
      .where(eq(warmupStats.emailAccountId, accountId))
      .orderBy(desc(warmupStats.date))
      .limit(30);

    // Calculate metrics
    let currentHealthScore = 100;
    let averageHealthScore = 100;
    let totalSent = 0;
    let totalOpened = 0;
    let totalReplied = 0;
    let totalBounces = 0;
    let totalSpamReports = 0;

    if (stats.length > 0) {
      // Current health score is the most recent day's score
      currentHealthScore = stats[0].healthScore;

      // Calculate totals and average
      let healthScoreSum = 0;
      
      for (const stat of stats) {
        totalSent += stat.emailsSent;
        totalOpened += stat.emailsOpened;
        totalReplied += stat.emailsReplied;
        totalBounces += stat.bounces;
        totalSpamReports += stat.spamReports;
        healthScoreSum += stat.healthScore;
      }

      averageHealthScore = Math.round(healthScoreSum / stats.length);
    }

    // Calculate rates
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100 * 100) / 100 : 0;
    const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100 * 100) / 100 : 0;
    const engagementScore = Math.round((openRate * 0.6 + replyRate * 0.4) * 100) / 100;

    // Determine health status
    let healthStatus;
    if (currentHealthScore >= 90) {
      healthStatus = 'excellent';
    } else if (currentHealthScore >= 70) {
      healthStatus = 'good';
    } else if (currentHealthScore >= 50) {
      healthStatus = 'fair';
    } else {
      healthStatus = 'poor';
    }

    // Return comprehensive health report
    return NextResponse.json({
      accountEmail: emailAccount.email,
      currentHealthScore,
      averageHealthScore,
      healthStatus,
      metrics: {
        totalSent,
        totalBounces,
        totalSpamReports,
        openRate,
        replyRate,
        engagementScore
      },
      warmupProgress: {
        status: emailAccount.warmupStatus,
        day: emailAccount.warmupDay
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
