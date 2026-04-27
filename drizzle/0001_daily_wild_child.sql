CREATE TABLE `child_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childName` varchar(128) NOT NULL,
	`ageBand` varchar(64),
	`weightReference` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `child_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fluid_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childProfileId` int NOT NULL,
	`userId` int NOT NULL,
	`fluidType` varchar(64) NOT NULL,
	`amountText` varchar(128),
	`loggedAt` bigint NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fluid_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childProfileId` int NOT NULL,
	`userId` int NOT NULL,
	`medicationType` enum('tylenol','advil','other') NOT NULL,
	`timeGiven` bigint NOT NULL,
	`amountText` varchar(128),
	`note` text,
	`reminderSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `output_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childProfileId` int NOT NULL,
	`userId` int NOT NULL,
	`outputType` enum('wet_diaper','urinated','vomited','diarrhea') NOT NULL,
	`loggedAt` bigint NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `output_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childProfileId` int NOT NULL,
	`medicationLogId` int,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('free','3day','7day','3month','annual') NOT NULL DEFAULT 'free',
	`status` enum('active','expired','cancelled','pending') NOT NULL DEFAULT 'pending',
	`startDate` timestamp,
	`endDate` timestamp,
	`stripeCustomerId` varchar(128),
	`stripeSessionId` varchar(256),
	`stripePriceId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symptom_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childProfileId` int NOT NULL,
	`userId` int NOT NULL,
	`symptomKey` varchar(64) NOT NULL,
	`symptomLabel` varchar(128),
	`value` boolean NOT NULL DEFAULT true,
	`loggedAt` bigint NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `symptom_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temperature_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childProfileId` int NOT NULL,
	`userId` int NOT NULL,
	`temperatureValue` varchar(16) NOT NULL,
	`temperatureUnit` enum('F','C') NOT NULL DEFAULT 'F',
	`method` varchar(64),
	`loggedAt` bigint NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `temperature_logs_id` PRIMARY KEY(`id`)
);
