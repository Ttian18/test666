-- CreateTable
CREATE TABLE "MenuAnalysis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "menuData" JSONB NOT NULL,
    "budget" DOUBLE PRECISION,
    "userNote" TEXT,
    "imageSize" INTEGER,
    "imageMimeType" TEXT,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuAnalysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MenuAnalysis" ADD CONSTRAINT "MenuAnalysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
