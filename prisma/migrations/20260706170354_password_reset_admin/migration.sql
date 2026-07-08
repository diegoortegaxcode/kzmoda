-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "customer_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

