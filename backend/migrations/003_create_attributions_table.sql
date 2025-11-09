-- ================================
-- MIGRATION: Create Attributions Table
-- ================================

CREATE TABLE IF NOT EXISTS attributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filleul_id INT NOT NULL,
    parrain_id INT NOT NULL,
    filiere ENUM('EAIN', 'EJ', 'EPA', 'EPM', 'ETTA') NOT NULL,
    attribution_date DATE NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (filleul_id) REFERENCES filleuls(id) ON DELETE CASCADE,
    FOREIGN KEY (parrain_id) REFERENCES parrains(id) ON DELETE CASCADE,
    
    INDEX idx_filleul_id (filleul_id),
    INDEX idx_parrain_id (parrain_id),
    INDEX idx_filiere (filiere),
    INDEX idx_session_id (session_id),
    INDEX idx_attribution_date (attribution_date),
    
    UNIQUE KEY unique_attribution (filleul_id, parrain_id, session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;