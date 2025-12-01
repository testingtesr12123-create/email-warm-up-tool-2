import { db } from '@/db';
import { warmup_stats } from '@/db/schema';

async function main() {
    // Check if stats already exist
    const existingStats = await db.select().from(warmup_stats).limit(1);
    
    if (existingStats.length > 0) {
        console.log('⚠️ Warmup stats already exist. Skipping seeding to avoid duplicates.');
        return;
    }

    const allStats = [];

    // Account configurations
    const accounts = [
        { id: 2, email: 'john.sales@company.com', currentDay: 12, pauseWeekends: true },
        { id: 3, email: 'sarah.marketing@business.io', currentDay: 8, pauseWeekends: false },
        { id: 4, email: 'mike.outreach@startup.co', currentDay: 25, pauseWeekends: true },
        { id: 5, email: 'lisa.growth@enterprise.com', currentDay: 35, pauseWeekends: false },
        { id: 6, email: 'david.bizdev@agency.net', currentDay: 42, pauseWeekends: true }
    ];

    // Generate 30 days of stats for each account
    for (const account of accounts) {
        for (let dayIndex = 0; dayIndex < 30; dayIndex++) {
            const date = new Date(Date.now() - (30 - dayIndex) * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            let emailsSent = 0;
            let openedPct = 0;
            let repliedPct = 0;
            let markedImportantPct = 0;
            let bounces = 0;
            let healthScore = 0;

            // Account ID 2 (john.sales, Day 12)
            if (account.id === 2) {
                if (dayIndex < 5) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 6);
                    openedPct = 70 + Math.random() * 10;
                    repliedPct = 15 + Math.random() * 10;
                    markedImportantPct = 10 + Math.random() * 5;
                    bounces = Math.random() > 0.7 ? 1 : 0;
                    healthScore = 65 + Math.random() * 5;
                } else if (dayIndex < 12) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 3) : 12 + Math.floor(Math.random() * 9);
                    openedPct = 75 + Math.random() * 10;
                    repliedPct = 20 + Math.random() * 10;
                    markedImportantPct = 12 + Math.random() * 6;
                    bounces = Math.random() > 0.8 ? 1 : 0;
                    healthScore = 72 + Math.random() * 10;
                } else if (dayIndex < 20) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 3) : 22 + Math.floor(Math.random() * 9);
                    openedPct = 78 + Math.random() * 7;
                    repliedPct = 20 + Math.random() * 8;
                    markedImportantPct = 15 + Math.random() * 5;
                    bounces = Math.random() > 0.9 ? 1 : 0;
                    healthScore = 80 + Math.random() * 8;
                } else {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 3) : 30 + Math.floor(Math.random() * 6);
                    openedPct = 80 + Math.random() * 8;
                    repliedPct = 22 + Math.random() * 8;
                    markedImportantPct = 15 + Math.random() * 7;
                    bounces = 0;
                    healthScore = 85 + Math.random() * 7;
                }
            }

            // Account ID 3 (sarah.marketing, Day 8, no pause)
            if (account.id === 3) {
                if (dayIndex < 4) {
                    emailsSent = 6 + Math.floor(Math.random() * 5);
                    openedPct = 68 + Math.random() * 10;
                    repliedPct = 18 + Math.random() * 7;
                    markedImportantPct = 10 + Math.random() * 5;
                    bounces = Math.random() > 0.7 ? 1 : 0;
                    healthScore = 62 + Math.random() * 6;
                } else if (dayIndex < 8) {
                    emailsSent = 12 + Math.floor(Math.random() * 7);
                    openedPct = 72 + Math.random() * 10;
                    repliedPct = 20 + Math.random() * 8;
                    markedImportantPct = 12 + Math.random() * 6;
                    bounces = Math.random() > 0.8 ? 1 : 0;
                    healthScore = 70 + Math.random() * 8;
                } else if (dayIndex < 15) {
                    emailsSent = 20 + Math.floor(Math.random() * 6);
                    openedPct = 75 + Math.random() * 10;
                    repliedPct = 22 + Math.random() * 8;
                    markedImportantPct = 14 + Math.random() * 6;
                    bounces = 0;
                    healthScore = 78 + Math.random() * 7;
                } else {
                    emailsSent = 25 + Math.floor(Math.random() * 6);
                    openedPct = 78 + Math.random() * 10;
                    repliedPct = 24 + Math.random() * 8;
                    markedImportantPct = 16 + Math.random() * 6;
                    bounces = 0;
                    healthScore = 82 + Math.random() * 8;
                }
            }

            // Account ID 4 (mike.outreach, Day 25)
            if (account.id === 4) {
                if (dayIndex < 10) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 4) : 8 + Math.floor(Math.random() * 8);
                    openedPct = 70 + Math.random() * 10;
                    repliedPct = 18 + Math.random() * 8;
                    markedImportantPct = 12 + Math.random() * 6;
                    bounces = Math.random() > 0.7 ? 1 : 0;
                    healthScore = 68 + Math.random() * 7;
                } else if (dayIndex < 20) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 13);
                    openedPct = 75 + Math.random() * 10;
                    repliedPct = 22 + Math.random() * 8;
                    markedImportantPct = 15 + Math.random() * 5;
                    bounces = Math.random() > 0.8 ? 1 : 0;
                    healthScore = 76 + Math.random() * 9;
                } else if (dayIndex < 25) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 4) : 35 + Math.floor(Math.random() * 8);
                    openedPct = 80 + Math.random() * 8;
                    repliedPct = 25 + Math.random() * 7;
                    markedImportantPct = 18 + Math.random() * 6;
                    bounces = 0;
                    healthScore = 86 + Math.random() * 7;
                } else {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 4) : 40 + Math.floor(Math.random() * 6);
                    openedPct = 82 + Math.random() * 8;
                    repliedPct = 26 + Math.random() * 8;
                    markedImportantPct = 20 + Math.random() * 6;
                    bounces = 0;
                    healthScore = 88 + Math.random() * 7;
                }
            }

            // Account ID 5 (lisa.growth, Day 35, no pause)
            if (account.id === 5) {
                if (dayIndex < 15) {
                    emailsSent = 5 + Math.floor((dayIndex / 15) * 20) + Math.floor(Math.random() * 5);
                    openedPct = 68 + Math.random() * 14;
                    repliedPct = 18 + Math.random() * 10;
                    markedImportantPct = 12 + Math.random() * 8;
                    bounces = Math.random() > 0.7 ? 1 : 0;
                    healthScore = 65 + Math.random() * 17;
                } else {
                    emailsSent = 40 + Math.floor(Math.random() * 11);
                    openedPct = 82 + Math.random() * 8;
                    repliedPct = 26 + Math.random() * 8;
                    markedImportantPct = 20 + Math.random() * 6;
                    bounces = 0;
                    healthScore = 88 + Math.random() * 7;
                }
            }

            // Account ID 6 (david.bizdev, Day 42)
            if (account.id === 6) {
                if (dayIndex < 20) {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 4) : 6 + Math.floor((dayIndex / 20) * 29) + Math.floor(Math.random() * 5);
                    openedPct = 70 + Math.random() * 15;
                    repliedPct = 20 + Math.random() * 10;
                    markedImportantPct = 14 + Math.random() * 8;
                    bounces = Math.random() > 0.7 ? 1 : 0;
                    healthScore = 68 + Math.random() * 18;
                } else {
                    emailsSent = isWeekend && account.pauseWeekends ? Math.floor(Math.random() * 4) : 45 + Math.floor(Math.random() * 6);
                    openedPct = 85 + Math.random() * 7;
                    repliedPct = 28 + Math.random() * 7;
                    markedImportantPct = 22 + Math.random() * 6;
                    bounces = 0;
                    healthScore = 90 + Math.random() * 6;
                }
            }

            const emailsOpened = Math.round(emailsSent * (openedPct / 100));
            const emailsReplied = Math.round(emailsSent * (repliedPct / 100));
            const emailsMarkedImportant = Math.round(emailsSent * (markedImportantPct / 100));

            allStats.push({
                email_account_id: account.id,
                date: dateStr,
                emails_sent: emailsSent,
                emails_opened: emailsOpened,
                emails_replied: emailsReplied,
                emails_marked_important: emailsMarkedImportant,
                bounces: bounces,
                spam_reports: 0,
                health_score: Math.round(healthScore * 10) / 10
            });
        }
    }

    await db.insert(warmup_stats).values(allStats);
    
    console.log('✅ Warmup stats seeder completed successfully - 150 records created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});