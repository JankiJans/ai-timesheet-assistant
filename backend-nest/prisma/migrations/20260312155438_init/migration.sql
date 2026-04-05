-- CreateTable
CREATE TABLE `Job` (
    `jobNumber` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',

    PRIMARY KEY (`jobNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Timesheet` (
    `id` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `jobNumber` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `hours` DOUBLE NOT NULL,
    `taskType` VARCHAR(191) NULL,
    `billable` BOOLEAN NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Timesheet_idempotencyKey_key`(`idempotencyKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_jobNumber_fkey` FOREIGN KEY (`jobNumber`) REFERENCES `Job`(`jobNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;
