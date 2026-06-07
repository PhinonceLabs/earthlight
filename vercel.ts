import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  ignoreCommand:
    'case "$VERCEL_GIT_COMMIT_REF" in __dolt_*) echo "Skipping Beads/Dolt sync branch: $VERCEL_GIT_COMMIT_REF"; exit 0 ;; *) exit 1 ;; esac',
};
