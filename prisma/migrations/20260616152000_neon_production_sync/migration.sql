DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'PaymentType' AND e.enumlabel = 'SEPARADO'
    )
  THEN
    ALTER TYPE "PaymentType" ADD VALUE 'SEPARADO';
  END IF;
END $$;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "cash_price" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "separate_deposit" DECIMAL(10,2);

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "sku_prefixes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "payment_proofs"
  ADD COLUMN IF NOT EXISTS "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "payment_type" "PaymentType" NOT NULL DEFAULT 'TRANSFERENCIA',
  ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewed_by" TEXT;

CREATE TABLE IF NOT EXISTS "notification_reads" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "notification_id" TEXT NOT NULL,
  "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_reads_user_id_fkey'
  ) THEN
    ALTER TABLE "notification_reads"
      ADD CONSTRAINT "notification_reads_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_proofs')
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'payment_proofs_reviewed_by_fkey'
    )
  THEN
    ALTER TABLE "payment_proofs"
      ADD CONSTRAINT "payment_proofs_reviewed_by_fkey"
      FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "notification_reads_user_id_notification_id_key"
  ON "notification_reads"("user_id", "notification_id");

CREATE INDEX IF NOT EXISTS "notification_reads_user_id_idx"
  ON "notification_reads"("user_id");

CREATE INDEX IF NOT EXISTS "notification_reads_read_at_idx"
  ON "notification_reads"("read_at");
