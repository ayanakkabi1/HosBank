USE hosebank_db;

-- Ajoute le PIN aux cartes existantes sans exposer cette valeur dans les vues.
SET @pin_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'cartes'
      AND column_name = 'pin'
);

SET @pin_migration = IF(
    @pin_exists = 0,
    'ALTER TABLE cartes ADD COLUMN pin VARCHAR(6) NOT NULL DEFAULT ''000000'' AFTER date_expiration',
    'SELECT 1'
);

PREPARE pin_statement FROM @pin_migration;
EXECUTE pin_statement;
DEALLOCATE PREPARE pin_statement;