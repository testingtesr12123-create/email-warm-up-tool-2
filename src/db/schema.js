import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const emailAccounts = sqliteTable('email_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  provider: text('provider').notNull(),
  smtpHost: text('smtp_host').notNull(),
  smtpPort: integer('smtp_port').notNull(),
  smtpSecure: integer('smtp_secure', { mode: 'boolean' }).notNull(),
  imapHost: text('imap_host').notNull(),
  imapPort: integer('imap_port').notNull(),
  username: text('username').notNull(),
  passwordEncrypted: text('password_encrypted').notNull(),
  status: text('status').notNull().default('active'),
  warmupStatus: text('warmup_status').notNull().default('not_started'),
  warmupDay: integer('warmup_day').notNull().default(0),
  dailyLimit: integer('daily_limit').notNull().default(30),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const warmupLogs = sqliteTable('warmup_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailAccountId: integer('email_account_id').notNull().references(() => emailAccounts.id),
  actionType: text('action_type').notNull(),
  recipientEmail: text('recipient_email'),
  subject: text('subject'),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  timestamp: integer('timestamp').notNull(),
});

export const warmupSettings = sqliteTable('warmup_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailAccountId: integer('email_account_id').notNull().unique().references(() => emailAccounts.id),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  dailyLimit: integer('daily_limit').notNull().default(30),
  enableReplies: integer('enable_replies', { mode: 'boolean' }).notNull().default(true),
  enableOpens: integer('enable_opens', { mode: 'boolean' }).notNull().default(true),
  enableMarkImportant: integer('enable_mark_important', { mode: 'boolean' }).notNull().default(true),
  pauseWeekends: integer('pause_weekends', { mode: 'boolean' }).notNull().default(false),
  rampUpDays: integer('ramp_up_days').notNull().default(15),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const warmupStats = sqliteTable('warmup_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailAccountId: integer('email_account_id').notNull().references(() => emailAccounts.id),
  date: text('date').notNull(),
  emailsSent: integer('emails_sent').notNull().default(0),
  emailsOpened: integer('emails_opened').notNull().default(0),
  emailsReplied: integer('emails_replied').notNull().default(0),
  emailsMarkedImportant: integer('emails_marked_important').notNull().default(0),
  bounces: integer('bounces').notNull().default(0),
  spamReports: integer('spam_reports').notNull().default(0),
  healthScore: integer('health_score').notNull().default(100),
});
