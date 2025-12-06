CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`tool_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tool_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_name` text NOT NULL,
	`duration_ms` integer NOT NULL,
	`status` text NOT NULL,
	`error_type` text,
	`timestamp` integer NOT NULL,
	`session_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tool_name_idx` ON `tool_calls` (`tool_name`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `tool_calls` (`timestamp`);--> statement-breakpoint
CREATE INDEX `timestamp_tool_name_idx` ON `tool_calls` (`timestamp`,`tool_name`);