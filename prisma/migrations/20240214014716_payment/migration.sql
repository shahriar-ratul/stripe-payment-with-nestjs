/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `paymentId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "paymentId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");
