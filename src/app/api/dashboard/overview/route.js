import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailAccounts, warmupStats } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Authorization header is required',
          code: 'MISSING_AUTH_HEADER'
        },
        { status: 401 }
      );
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token || token.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Invalid authorization format. Expected: Bearer <token>',
          code: 'INVALID_AUTH_FORMAT'
        },
        { status: 401 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch all email accounts
    const accounts = await db.select().from(emailAccounts);

    // Count total accounts
    const totalAccounts = accounts.length;

    // Count active warmups
    const activeWarmups = accounts.filter(
      account => account.warmupStatus === 'warming_up'
    ).length;

    // Fetch today's stats for all accounts
    const todayStats = await db.select()
      .from(warmupStats)
      .where(eq(warmupStats.date, today));

    // Calculate total emails sent today
    const totalSentToday = todayStats.reduce(
      (sum, stat) => sum + stat.emailsSent,
      0
    );

    // Get latest stats for each account to calculate average health score
    const latestStatsPerAccount = await Promise.all(
      accounts.map(async (account) => {
        const stats = await db.select()
          .from(warmupStats)
          .where(eq(warmupStats.emailAccountId, account.id))
          .orderBy(sql`date DESC`)
          .limit(1);
        
        return stats.length > 0 ? stats[0] : null;
      })
    );

    // Calculate average health score
    const validHealthScores = latestStatsPerAccount
      .filter(stat => stat !== null)
      .map(stat => stat.healthScore);

    const averageHealthScore = validHealthScores.length > 0
      ? Math.round(
          validHealthScores.reduce((sum, score) => sum + score, 0) / 
          validHealthScores.length
        )
      : 0;

    // Group accounts by status
    const accountsByStatus = {
      active: accounts.filter(account => account.status === 'active').length,
      paused: accounts.filter(account => account.status === 'paused').length,
      error: accounts.filter(account => account.status === 'error').length,
    };

    // Get recent activity (latest 5 accounts with warmup info)
    const recentActivity = accounts
      .filter(account => account.warmupStatus !== 'not_started')
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map(account => ({
        id: account.id,
        email: account.email,
        warmupStatus: account.warmupStatus,
        warmupDay: account.warmupDay,
        dailyLimit: account.dailyLimit,
        status: account.status,
        updatedAt: account.updatedAt,
      }));

    // Return dashboard overview
    return NextResponse.json({
      totalAccounts,
      activeWarmups,
      totalSentToday,
      averageHealthScore,
      accountsByStatus,
      recentActivity,
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
