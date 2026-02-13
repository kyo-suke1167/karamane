-- CreateTable
CREATE TABLE "setlists" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setlist_entries" (
    "id" SERIAL NOT NULL,
    "setlist_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "setlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "setlist_entries_setlist_id_idx" ON "setlist_entries"("setlist_id");

-- AddForeignKey
ALTER TABLE "setlists" ADD CONSTRAINT "setlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setlist_entries" ADD CONSTRAINT "setlist_entries_setlist_id_fkey" FOREIGN KEY ("setlist_id") REFERENCES "setlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setlist_entries" ADD CONSTRAINT "setlist_entries_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
