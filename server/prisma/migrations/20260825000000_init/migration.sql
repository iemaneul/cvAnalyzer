CREATE TABLE "Analysis" (
  "id" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "jobDescription" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "resumeSkills" JSONB NOT NULL,
  "jobSkills" JSONB NOT NULL,
  "matchedSkills" JSONB NOT NULL,
  "missingSkills" JSONB NOT NULL,
  "suggestions" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);
