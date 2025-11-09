-- ================================
-- MIGRATION: Insert Example Data
-- ================================

-- Insertion d'exemples de données pour tester le système
-- Ces données seront remplacées par les vraies données du frontend

-- Insertion de parrains exemples
INSERT INTO parrains (full_name, email, filiere, created_at, updated_at) VALUES
('MARTIN Jean', 'jean.martin@institut-istic.edu', 'EAIN', NOW(), NOW()),
('DUBOIS Marie', 'marie.dubois@institut-istic.edu', 'EPM', NOW(), NOW()),
('BERNARD Paul', 'paul.bernard@institut-istic.edu', 'EJ', NOW(), NOW()),
('PETIT Sophie', 'sophie.petit@institut-istic.edu', 'EPA', NOW(), NOW()),
('ROBERT Lucas', 'lucas.robert@institut-istic.edu', 'ETTA', NOW(), NOW());

-- Insertion de filleuls exemples
INSERT INTO filleuls (full_name, email, filiere, created_at, updated_at) VALUES
('LAURENT Emma', 'emma.laurent@institut-istic.edu', 'EAIN', NOW(), NOW()),
('SIMON Thomas', 'thomas.simon@institut-istic.edu', 'EPM', NOW(), NOW()),
('MICHEL Julie', 'julie.michel@institut-istic.edu', 'EJ', NOW(), NOW()),
('GARCIA Antoine', 'antoine.garcia@institut-istic.edu', 'EPA', NOW(), NOW()),
('RODRIGUEZ Clara', 'clara.rodriguez@institut-istic.edu', 'ETTA', NOW(), NOW());

-- Insertion d'attributions exemples
INSERT INTO attributions (parrain_id, filleul_id, session_id, attribution_date, filiere, created_at, updated_at) VALUES
(1, 1, CONCAT('SESSION_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s')), NOW(), 'EAIN', NOW(), NOW()),
(2, 2, CONCAT('SESSION_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s')), NOW(), 'EPM', NOW(), NOW()),
(3, 3, CONCAT('SESSION_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s')), NOW(), 'EJ', NOW(), NOW()),
(4, 4, CONCAT('SESSION_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s')), NOW(), 'EPA', NOW(), NOW()),
(5, 5, CONCAT('SESSION_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s')), NOW(), 'ETTA', NOW(), NOW());

-- Mise à jour du cache des statistiques
INSERT INTO stats_cache (cache_key, cache_value, filiere, expires_at, created_at, updated_at) VALUES
('total_parrains', '5', 'ALL', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('total_filleuls', '5', 'ALL', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('total_attributions', '5', 'ALL', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('parrains_EAIN', '1', 'EAIN', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('filleuls_EAIN', '1', 'EAIN', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('parrains_EPM', '1', 'EPM', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('filleuls_EPM', '1', 'EPM', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('parrains_EJ', '1', 'EJ', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('filleuls_EJ', '1', 'EJ', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('parrains_EPA', '1', 'EPA', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('filleuls_EPA', '1', 'EPA', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('parrains_ETTA', '1', 'ETTA', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW()),
('filleuls_ETTA', '1', 'ETTA', DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), NOW());