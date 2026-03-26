-- CreateTable
CREATE TABLE "PleEvent" (
    "id" SERIAL NOT NULL,
    "dateKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "PleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PleEvent_dateKey_key" ON "PleEvent"("dateKey");

-- Données initiales (anciennes entrées codées en dur)
INSERT INTO "PleEvent" ("dateKey", "label") VALUES
  ('2026-04-18', 'WrestleMania 42 (Night 1)'),
  ('2026-04-19', 'WrestleMania 42 (Night 2)'),
  ('2026-05-31', 'Clash in Italy'),
  ('2026-08-01', 'SummerSlam (Night 1)'),
  ('2026-08-02', 'SummerSlam (Night 2)'),
  ('2026-09-06', 'Money in the Bank');
