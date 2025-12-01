import { db } from '@/db';
import { email_accounts, warmup_settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query all email accounts ordered by ID
    const accounts = await db.select().from(email_accounts).orderBy(email_accounts.id);
    
    if (accounts.length < 8) {
        console.log('⚠️ Not enough email accounts. Expected at least 8 accounts.');
        return;
    }
    
    // Skip the first account and take the next 7
    const targetAccounts = accounts.slice(1, 8);
    
    // Settings patterns for each account
    const settingsPatterns = [
        { enabled: 1, daily_limit: 35, enable_replies: 1, enable_opens: 1, enable_mark_important: 1, pause_weekends: 1, ramp_up_days: 18 },
        { enabled: 1, daily_limit: 30, enable_replies: 1, enable_opens: 1, enable_mark_important: 1, pause_weekends: 0, ramp_up_days: 15 },
        { enabled: 1, daily_limit: 45, enable_replies: 1, enable_opens: 1, enable_mark_important: 1, pause_weekends: 1, ramp_up_days: 20 },
        { enabled: 1, daily_limit: 50, enable_replies: 1, enable_opens: 1, enable_mark_important: 1, pause_weekends: 0, ramp_up_days: 20 },
        { enabled: 1, daily_limit: 50, enable_replies: 1, enable_opens: 1, enable_mark_important: 0, pause_weekends: 1, ramp_up_days: 18 },
        { enabled: 0, daily_limit: 25, enable_replies: 1, enable_opens: 1, enable_mark_important: 1, pause_weekends: 1, ramp_up_days: 15 },
        { enabled: 0, daily_limit: 20, enable_replies: 1, enable_opens: 1, enable_mark_important: 1, pause_weekends: 0, ramp_up_days: 15 }
    ];
    
    const settingsToCreate = [];
    
    for (let i = 0; i < targetAccounts.length; i++) {
        const account = targetAccounts[i];
        
        // Check if settings already exist for this account
        const existingSettings = await db
            .select()
            .from(warmup_settings)
            .where(eq(warmup_settings.email_account_id, account.id))
            .limit(1);
        
        if (existingSettings.length > 0) {
            console.log(`⏭️ Skipping account ${account.id} (${account.email}) - settings already exist`);
            continue;
        }
        
        const pattern = settingsPatterns[i];
        const currentTimestamp = Date.now();
        
        settingsToCreate.push({
            email_account_id: account.id,
            enabled: pattern.enabled,
            daily_limit: pattern.daily_limit,
            enable_replies: pattern.enable_replies,
            enable_opens: pattern.enable_opens,
            enable_mark_important: pattern.enable_mark_important,
            pause_weekends: pattern.pause_weekends,
            ramp_up_days: pattern.ramp_up_days,
            created_at: currentTimestamp,
            updated_at: currentTimestamp
        });
    }
    
    if (settingsToCreate.length === 0) {
        console.log('✅ All accounts already have warmup settings configured');
        return;
    }
    
    await db.insert(warmup_settings).values(settingsToCreate);
    
    console.log(`✅ Warmup settings seeder completed successfully - created ${settingsToCreate.length} settings`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});