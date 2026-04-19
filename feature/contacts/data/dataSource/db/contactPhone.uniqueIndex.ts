export const CONTACTS_ACTIVE_IDENTITY_PHONE_UNIQUE_INDEX_NAME =
  "contacts_account_contact_type_identity_phone_active_unique_idx";

export const CONTACTS_ACTIVE_IDENTITY_PHONE_UNIQUE_INDEX_SQL = `
CREATE UNIQUE INDEX IF NOT EXISTS ${CONTACTS_ACTIVE_IDENTITY_PHONE_UNIQUE_INDEX_NAME}
ON contacts (account_remote_id, contact_type, normalized_phone_number)
WHERE deleted_at IS NULL
  AND is_archived = 0
  AND normalized_phone_number IS NOT NULL
  AND LENGTH(TRIM(normalized_phone_number)) > 0;
`.trim();

export const DROP_CONTACTS_ACTIVE_IDENTITY_PHONE_UNIQUE_INDEX_SQL = `
DROP INDEX IF EXISTS ${CONTACTS_ACTIVE_IDENTITY_PHONE_UNIQUE_INDEX_NAME};
`.trim();

export const BACKFILL_CONTACT_NORMALIZED_PHONE_SQL = `
UPDATE contacts
SET normalized_phone_number =
  CASE
    WHEN phone_number IS NULL OR LENGTH(TRIM(phone_number)) = 0 THEN NULL
    ELSE REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(TRIM(phone_number), ' ', ''),
            '-', ''),
          '(', ''),
        ')', ''),
      '.', ''),
    '/', '')
  END
WHERE
  normalized_phone_number IS NULL
  OR normalized_phone_number <> CASE
    WHEN phone_number IS NULL OR LENGTH(TRIM(phone_number)) = 0 THEN NULL
    ELSE REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(TRIM(phone_number), ' ', ''),
            '-', ''),
          '(', ''),
        ')', ''),
      '.', ''),
    '/', '')
  END;
`.trim();

export const DEDUPE_CONTACT_NORMALIZED_PHONE_SQL = `
UPDATE contacts
SET
  normalized_phone_number = NULL,
  updated_at = CAST(strftime('%s', 'now') AS INTEGER) * 1000
WHERE
  deleted_at IS NULL
  AND normalized_phone_number IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM contacts AS newer
    WHERE
      newer.account_remote_id = contacts.account_remote_id
      AND newer.contact_type = contacts.contact_type
      AND newer.normalized_phone_number = contacts.normalized_phone_number
      AND newer.deleted_at IS NULL
      AND (
        newer.updated_at > contacts.updated_at
        OR (
          newer.updated_at = contacts.updated_at
          AND newer.created_at > contacts.created_at
        )
        OR (
          newer.updated_at = contacts.updated_at
          AND newer.created_at = contacts.created_at
          AND newer.id > contacts.id
        )
      )
  );
`.trim();
