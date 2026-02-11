-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sites" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "lastUpdated" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "terms" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
