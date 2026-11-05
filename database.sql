-- ==============================================================================
-- AL Rehman Meta Eggs — Production Database Schema (database.sql)
-- Compatible with MySQL (phpMyAdmin 5.x/8.x) and SQLite 3.x
-- ==============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` VARCHAR(32) NOT NULL UNIQUE DEFAULT '1197',
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `email` VARCHAR(128) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(128) NOT NULL DEFAULT 'Valued Farmer',
  `phone` VARCHAR(20) DEFAULT NULL,
  `upliner_code` VARCHAR(32) DEFAULT 'SYSTEM',
  `referral_code` VARCHAR(32) NOT NULL UNIQUE,
  `balance_pkr` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `egg_vault` INT(11) NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_referral` (`referral_code`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: farm_assets (VIP Hen Contracts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `farm_assets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `asset_name` VARCHAR(128) NOT NULL DEFAULT 'GEN-3 High Yield Livestock',
  `units` INT(11) NOT NULL DEFAULT 1,
  `unit_cost` DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  `daily_yield_per_unit` INT(11) NOT NULL DEFAULT 1,
  `term_days` INT(11) NOT NULL DEFAULT 120,
  `total_return_eggs` INT(11) NOT NULL DEFAULT 120,
  `gateway` VARCHAR(32) NOT NULL DEFAULT 'Easypisa',
  `status` ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `purchased_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_assets_user` (`user_id`),
  INDEX `idx_assets_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: harvest_logs (Daily Egg Collections & 24h Cooldown)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `harvest_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `active_units` INT(11) NOT NULL DEFAULT 1,
  `eggs_collected` INT(11) NOT NULL DEFAULT 1,
  `harvested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `next_harvest_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_harvest_user` (`user_id`, `harvested_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: p2p_stores (Verified Merchant Buyers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `p2p_stores` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `tag` VARCHAR(64) NOT NULL DEFAULT 'Verified Partner',
  `rate_per_egg` DECIMAL(6, 2) NOT NULL DEFAULT 30.00,
  `rating` DECIMAL(3, 1) NOT NULL DEFAULT 4.9,
  `trades_count` INT(11) NOT NULL DEFAULT 500,
  `min_eggs` INT(11) NOT NULL DEFAULT 1,
  `max_eggs` INT(11) NOT NULL DEFAULT 10000,
  `status` ENUM('online', 'busy', 'offline') NOT NULL DEFAULT 'online',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: withdrawals (P2P Egg Liquidation & Cashouts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `store_id` INT(11) NOT NULL,
  `store_name` VARCHAR(128) NOT NULL,
  `eggs_liquidated` INT(11) NOT NULL,
  `rate` DECIMAL(6, 2) NOT NULL,
  `amount_pkr` DECIMAL(12, 2) NOT NULL,
  `method` ENUM('Easypaisa', 'JazzCash', 'Bank') NOT NULL,
  `account_title` VARCHAR(128) NOT NULL,
  `account_number` VARCHAR(64) NOT NULL,
  `bank_name` VARCHAR(128) DEFAULT NULL,
  `status` ENUM('Pending', 'Processing', 'Completed', 'Rejected') NOT NULL DEFAULT 'Completed',
  `tx_hash` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_with_user` (`user_id`),
  INDEX `idx_with_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: transactions (General Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `type` ENUM('BUY_ASSET', 'HARVEST_EGG', 'SELL_EGG', 'BONUS', 'REFERRAL') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `unit` ENUM('PKR', 'Egg') NOT NULL DEFAULT 'PKR',
  `description` VARCHAR(255) NOT NULL,
  `status` ENUM('Completed', 'Pending', 'Failed') NOT NULL DEFAULT 'Completed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tx_user` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: platform_settings (Global Farm, Pricing Economics & Gateway Controls)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `platform_settings` (
  `id` INT(11) NOT NULL DEFAULT 1,
  `egg_base_price` DECIMAL(6, 2) NOT NULL DEFAULT 30.00,
  `hen_unit_price` DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  `daily_egg_yield` INT(11) NOT NULL DEFAULT 1,
  `contract_duration_days` INT(11) NOT NULL DEFAULT 120,
  `min_withdrawal_eggs` INT(11) NOT NULL DEFAULT 1,
  `min_withdrawal_pkr` DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
  `max_withdrawal_eggs` INT(11) NOT NULL DEFAULT 10000,
  `referral_commission_level1` DECIMAL(5, 2) NOT NULL DEFAULT 2.00,
  `referral_commission_level2` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  `referral_commission_pkr` DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  `is_maintenance` TINYINT(1) NOT NULL DEFAULT 0,
  `deposit_gateways` JSON DEFAULT NULL,
  `market_rates` JSON DEFAULT NULL,
  `community_links` JSON DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table: support_messages (VIP Support Chat & In-App Helpdesk)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL,
  `sender_role` ENUM('farmer', 'admin', 'system') NOT NULL DEFAULT 'farmer',
  `sender_name` VARCHAR(128) NOT NULL DEFAULT 'Farmer',
  `sender_email` VARCHAR(128) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `is_edited` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_messages_user_id` (`user_id`),
  KEY `idx_support_messages_created_at` (`created_at`),
  KEY `idx_support_messages_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- Seed Data Initialization
-- ==============================================================================

-- Seed Platform Settings & Dynamic Economics
INSERT INTO `platform_settings` (`id`, `egg_base_price`, `hen_unit_price`, `daily_egg_yield`, `contract_duration_days`, `min_withdrawal_eggs`, `min_withdrawal_pkr`, `max_withdrawal_eggs`, `referral_commission_level1`, `referral_commission_level2`, `referral_commission_pkr`)
VALUES (1, 30.00, 500.00, 1, 120, 1, 30.00, 10000, 2.00, 1.00, 50.00)
ON DUPLICATE KEY UPDATE `hen_unit_price`=VALUES(`hen_unit_price`);

-- Seed Verified Stores
INSERT INTO `p2p_stores` (`id`, `name`, `tag`, `rate_per_egg`, `rating`, `trades_count`, `min_eggs`, `max_eggs`, `status`) VALUES
(1, 'Sonica FORM STORE', 'Fast Payout ⚡', 32.00, 4.9, 1420, 1, 10000, 'online'),
(2, 'Usmaina Poltry Farm', 'Instant Escrow 🛡️', 30.00, 4.8, 980, 1, 5000, 'online'),
(3, 'Syed poultry farm', 'Top Rate VIP 👑', 33.00, 5.0, 2350, 1, 20000, 'online')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Seed Default Admin / Demo Account (Password: password123)
-- Hash generated via bcrypt
INSERT INTO `users` (`id`, `account_id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `referral_code`, `balance_pkr`, `egg_vault`, `role`) VALUES
(1, '1197', 'mrsaqib242', 'admin@gmail.com', '$2y$10$tM3WkJgQ83QW.g7N4Y93sOGh5e6uYg8o2iF3L8Z0A8qQ9.Z6Z3X2O', 'Saqib Khan', '03001234567', 'ALR-1197', 1500.00, 24, 'admin')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

-- Seed Initial Active Hen Asset for Demo User
INSERT INTO `farm_assets` (`id`, `user_id`, `asset_name`, `units`, `unit_cost`, `daily_yield_per_unit`, `term_days`, `total_return_eggs`, `gateway`, `status`, `purchased_at`, `expires_at`) VALUES
(1, 1, 'GEN-3 High Yield Livestock', 2, 500.00, 1, 120, 120, 'Easypisa', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 120 DAY))
ON DUPLICATE KEY UPDATE `units`=VALUES(`units`);

COMMIT;
