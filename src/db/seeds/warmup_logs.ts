import { db } from '@/db';
import { warmup_logs } from '@/db/schema';

async function main() {
    // Check if logs already exist
    const existingLogs = await db.select().from(warmup_logs).limit(1);
    
    if (existingLogs.length > 0) {
        console.log('⚠️ Warmup logs already exist. Skipping seeding to avoid duplicates.');
        return;
    }

    const recipientEmails = [
        'warmup-1@emailwarmup.io',
        'warmup-2@emailwarmup.io',
        'warmup-3@emailwarmup.io',
        'warmup-partner-a@warmupnetwork.com',
        'warmup-partner-b@warmupnetwork.com',
        'warmup-partner-c@warmupnetwork.com',
        'warmup-node-1@senderscore.net',
        'warmup-node-2@senderscore.net',
        'warmup-node-3@senderscore.net',
        'inbox-test-1@inboxready.io',
        'inbox-test-2@inboxready.io',
        'inbox-test-3@inboxready.io',
    ];

    const subjects = [
        'Quick question',
        'Following up',
        "Thought you'd find this interesting",
        'Re: Your inquiry',
        'Checking in',
        'Quick update',
        'Re: Last conversation',
        'Interesting article',
        'Thanks for connecting',
        'Your thoughts?',
        'Brief question',
        "Hope you're well",
    ];

    const actionTypes = ['sent', 'opened', 'replied', 'marked_important', 'bounced'];

    function getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomActionType(): string {
        const rand = Math.random();
        if (rand < 0.5) return 'sent';
        if (rand < 0.8) return 'opened';
        if (rand < 0.92) return 'replied';
        if (rand < 0.98) return 'marked_important';
        return 'bounced';
    }

    function generateTimestamp(): number {
        const now = Date.now();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

        if (Math.random() < 0.4) {
            return now - Math.floor(Math.random() * twoDaysInMs);
        }
        return now - Math.floor(Math.random() * sevenDaysInMs);
    }

    function getStatusAndError(actionType: string): { status: string; errorMessage: string | null } {
        const isFailed = Math.random() < 0.05;

        if (!isFailed) {
            return { status: 'success', errorMessage: null };
        }

        if (actionType === 'bounced') {
            const bouncedErrors = ['Recipient mailbox full', 'Invalid recipient address'];
            return { status: 'failed', errorMessage: getRandomElement(bouncedErrors) };
        }

        if (actionType === 'sent') {
            const sentErrors = ['SMTP connection timeout', 'Authentication failed'];
            return { status: 'failed', errorMessage: getRandomElement(sentErrors) };
        }

        return { status: 'success', errorMessage: null };
    }

    const accountDistribution = [
        { accountId: 2, count: 25 },
        { accountId: 3, count: 25 },
        { accountId: 4, count: 30 },
        { accountId: 5, count: 20 },
        { accountId: 6, count: 20 },
    ];

    const allLogs = [];

    for (const { accountId, count } of accountDistribution) {
        for (let i = 0; i < count; i++) {
            const actionType = getRandomActionType();
            const { status, errorMessage } = getStatusAndError(actionType);

            allLogs.push({
                email_account_id: accountId,
                action_type: actionType,
                recipient_email: getRandomElement(recipientEmails),
                subject: getRandomElement(subjects),
                status: status,
                error_message: errorMessage,
                timestamp: generateTimestamp(),
            });
        }
    }

    allLogs.sort((a, b) => b.timestamp - a.timestamp);

    await db.insert(warmup_logs).values(allLogs);

    console.log('✅ Warmup logs seeder completed successfully - 120 logs created across 5 accounts');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});