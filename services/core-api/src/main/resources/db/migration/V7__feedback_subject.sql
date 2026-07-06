ALTER TABLE feedback
    ADD COLUMN subject VARCHAR(150);

UPDATE feedback
SET subject = CASE
    WHEN LENGTH(message) <= 80 THEN message
    ELSE SUBSTRING(message FROM 1 FOR 77) || '...'
END
WHERE subject IS NULL;
