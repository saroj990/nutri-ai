import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";
import { clearAuthSession } from "@/lib/auth-session";

export async function clearAllAppData(): Promise<void> {
  const db = getDatabase();

  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
  });

  clearAuthSession();
  resetDatabaseForTesting();
}
