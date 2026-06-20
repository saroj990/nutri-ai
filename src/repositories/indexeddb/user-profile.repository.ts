import type { UserProfileRepository } from "@/domain/repositories/user-profile.repository";
import type { UserProfile } from "@/domain/entities/user-profile";
import { DEFAULT_USER_PROFILE_ID } from "@/lib/constants";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

export class IndexedDBUserProfileRepository implements UserProfileRepository {
  async get(): Promise<UserProfile | null> {
    const db = getDatabase();
    return (await db.userProfile.get(DEFAULT_USER_PROFILE_ID)) ?? null;
  }

  async save(profile: UserProfile): Promise<void> {
    const db = getDatabase();
    await db.userProfile.put({ ...profile, id: DEFAULT_USER_PROFILE_ID });
  }

  async delete(): Promise<void> {
    const db = getDatabase();
    await db.userProfile.delete(DEFAULT_USER_PROFILE_ID);
  }
}
