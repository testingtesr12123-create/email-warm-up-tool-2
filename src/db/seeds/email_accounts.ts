import { db } from '@/db';
import { email_accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const existingAccount = await db
        .select()
        .from(email_accounts)
        .where(eq(email_accounts.email, 'john.sales@company.com'))
        .limit(1);

    if (existingAccount.length > 0) {
        console.log('⚠️ Email accounts already seeded. Skipping seeder.');
        return;
    }

    const sampleAccounts = [
        {
            email: 'john.sales@company.com',
            provider: 'gmail',
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'imap.gmail.com',
            imap_port: 993,
            username: 'john.sales@company.com',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'active',
            warmup_status: 'warming_up',
            warmup_day: 12,
            daily_limit: 35,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
        {
            email: 'sarah.marketing@business.io',
            provider: 'custom',
            smtp_host: 'mail.business.io',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'imap.business.io',
            imap_port: 993,
            username: 'sarah.marketing@business.io',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'active',
            warmup_status: 'warming_up',
            warmup_day: 8,
            daily_limit: 30,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
        {
            email: 'mike.outreach@startup.co',
            provider: 'outlook',
            smtp_host: 'smtp.office365.com',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'outlook.office365.com',
            imap_port: 993,
            username: 'mike.outreach@startup.co',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'active',
            warmup_status: 'warming_up',
            warmup_day: 25,
            daily_limit: 45,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
        {
            email: 'lisa.growth@enterprise.com',
            provider: 'gmail',
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'imap.gmail.com',
            imap_port: 993,
            username: 'lisa.growth@enterprise.com',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'active',
            warmup_status: 'completed',
            warmup_day: 35,
            daily_limit: 50,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
        {
            email: 'david.bizdev@agency.net',
            provider: 'yahoo',
            smtp_host: 'smtp.mail.yahoo.com',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'imap.mail.yahoo.com',
            imap_port: 993,
            username: 'david.bizdev@agency.net',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'active',
            warmup_status: 'completed',
            warmup_day: 42,
            daily_limit: 50,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
        {
            email: 'emma.partnerships@tech.io',
            provider: 'outlook',
            smtp_host: 'smtp.office365.com',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'outlook.office365.com',
            imap_port: 993,
            username: 'emma.partnerships@tech.io',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'active',
            warmup_status: 'paused',
            warmup_day: 5,
            daily_limit: 25,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
        {
            email: 'alex.sales@failed-domain.com',
            provider: 'custom',
            smtp_host: 'mail.failed-domain.com',
            smtp_port: 587,
            smtp_secure: 1,
            imap_host: 'imap.failed-domain.com',
            imap_port: 993,
            username: 'alex.sales@failed-domain.com',
            password_encrypted: 'encrypted_password_hash_here',
            status: 'error',
            warmup_status: 'not_started',
            warmup_day: 0,
            daily_limit: 20,
            created_at: Date.now(),
            updated_at: Date.now(),
        },
    ];

    await db.insert(email_accounts).values(sampleAccounts);

    console.log('✅ Email accounts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});