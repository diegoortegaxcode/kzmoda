-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotions_product_id_idx" ON "promotions"("product_id");

-- CreateIndex
CREATE INDEX "promotions_active_idx" ON "promotions"("active");

-- CreateIndex
CREATE INDEX "promotions_ends_at_idx" ON "promotions"("ends_at");

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
