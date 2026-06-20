import type { SettingsRepository } from "@/domain/repositories/settings.repository";
import type { AppSettings } from "@/domain/entities/settings";
import { DEFAULT_SETTINGS } from "@/domain/entities/settings";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

const DEFAULT_SETTINGS_ID = "default";

export class IndexedDBSettingsRepository implements SettingsRepository {
  async get(): Promise<AppSettings> {
    const db = getDatabase();
    const stored = await db.settings.get(DEFAULT_SETTINGS_ID);
    if (stored) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...settings } = stored;
      return settings;
    }
    return {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
  }

  async save(settings: AppSettings): Promise<void> {
    const db = getDatabase();
    await db.settings.put({ ...settings, id: DEFAULT_SETTINGS_ID });
  }
}
