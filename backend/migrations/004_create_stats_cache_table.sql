-- ================================
-- MIGRATION: Create Stats Cache Table
-- ================================

CREATE TABLE IF NOT EXISTS stats_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL,
    cache_value TEXT NOT NULL,
    filiere VARCHAR(50) DEFAULT 'ALL',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cache_key (cache_key),
    INDEX idx_filiere (filiere),
    INDEX idx_expires_at (expires_at),
    UNIQUE KEY unique_cache_filiere (cache_key, filiere)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;