-- CreateTable
CREATE TABLE "restaurant_search_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "search_query" TEXT NOT NULL,
    "location" TEXT,
    "search_results" JSONB NOT NULL,
    "result_count" INTEGER NOT NULL DEFAULT 0,
    "user_preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_search_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "restaurant_search_history" ADD CONSTRAINT "restaurant_search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "restaurant_search_history_user_id_idx" ON "restaurant_search_history"("user_id");

-- CreateIndex
CREATE INDEX "restaurant_search_history_created_at_idx" ON "restaurant_search_history"("created_at");

-- CreateIndex
CREATE INDEX "restaurant_search_history_search_query_idx" ON "restaurant_search_history"("search_query");
