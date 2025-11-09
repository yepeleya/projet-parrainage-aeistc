-- ================================
-- MIGRATION: Create View Attributions Completes
-- ================================

CREATE OR REPLACE VIEW v_attributions_completes AS
SELECT 
    a.id AS attribution_id,
    a.filleul_id,
    a.parrain_id,
    a.filiere,
    a.attribution_date,
    a.session_id,
    
    -- Informations du filleul
    f.full_name AS filleul_name,
    f.email AS filleul_email,
    
    -- Informations du parrain
    p.full_name AS parrain_name,
    p.email AS parrain_email,
    
    -- Métadonnées
    a.created_at,
    a.updated_at
    
FROM attributions a
INNER JOIN filleuls f ON a.filleul_id = f.id
INNER JOIN parrains p ON a.parrain_id = p.id
ORDER BY a.created_at DESC, a.id;