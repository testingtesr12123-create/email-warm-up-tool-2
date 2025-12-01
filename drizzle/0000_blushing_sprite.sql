CREATE TABLE `email_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	`smtp_host` text NOT NULL,
	`smtp_port` integer NOT NULL,
	`smtp_secure` integer NOT NULL,
	`imap_host` text NOT NULL,
	`imap_port` integer NOT NULL,
	`username` text NOT NULL,
	`password_encrypted` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`warmup_status` text DEFAULT 'not_started' NOT NULL,
	`warmup_day` integer DEFAULT 0 NOT NULL,
	`daily_limit` integer DEFAULT 30 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_accounts_email_unique` ON `email_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `warmup_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email_account_id` integer NOT NULL,
	`action_type` text NOT NULL,
	`recipient_email` text,
	`subject` text,
	`status` text NOT NULL,
	`error_message` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`email_account_id`) REFERENCES `email_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `warmup_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email_account_id` integer NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`daily_limit` integer DEFAULT 30 NOT NULL,
	`enable_replies` integer DEFAULT true NOT NULL,
	`enable_opens` integer DEFAULT true NOT NULL,
	`enable_mark_important` integer DEFAULT true NOT NULL,
	`pause_weekends` integer DEFAULT false NOT NULL,
	`ramp_up_days` integer DEFAULT 15 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`email_account_id`) REFERENCES `email_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `warmup_settings_email_account_id_unique` ON `warmup_settings` (`email_account_id`);--> statement-breakpoint
CREATE TABLE `warmup_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email_account_id` integer NOT NULL,
	`date` text NOT NULL,
	`emails_sent` integer DEFAULT 0 NOT NULL,
	`emails_opened` integer DEFAULT 0 NOT NULL,
	`emails_replied` integer DEFAULT 0 NOT NULL,
	`emails_marked_important` integer DEFAULT 0 NOT NULL,
	`bounces` integer DEFAULT 0 NOT NULL,
	`spam_reports` integer DEFAULT 0 NOT NULL,
	`health_score` integer DEFAULT 100 NOT NULL,
	FOREIGN KEY (`email_account_id`) REFERENCES `email_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
