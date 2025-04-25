-- CreateTable
CREATE TABLE "Options" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wrestler" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "showName" TEXT,
    "lastSeen" TIMESTAMP(3),

    CONSTRAINT "Wrestler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "win" BOOLEAN NOT NULL,
    "loose" BOOLEAN NOT NULL,
    "draw" BOOLEAN NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "wrestlerId" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Show_name_key" ON "Show"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Wrestler_name_key" ON "Wrestler"("name");

-- AddForeignKey
ALTER TABLE "Wrestler" ADD CONSTRAINT "Wrestler_showName_fkey" FOREIGN KEY ("showName") REFERENCES "Show"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_wrestlerId_fkey" FOREIGN KEY ("wrestlerId") REFERENCES "Wrestler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
