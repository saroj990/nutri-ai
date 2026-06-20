import type { LocalAuthRepository } from "@/domain/repositories/local-auth.repository";
import type { LocalAuthAccount } from "@/domain/entities/local-auth";
import { LOCAL_AUTH_ACCOUNT_ID } from "@/domain/entities/local-auth";
import { getDatabase } from "@/infrastructure/database/nutriai-db";

export class IndexedDBLocalAuthRepository implements LocalAuthRepository {
  async get(): Promise<LocalAuthAccount | null> {
    const db = getDatabase();
    return (await db.localAuth.get(LOCAL_AUTH_ACCOUNT_ID)) ?? null;
  }

  async save(account: LocalAuthAccount): Promise<void> {
    const db = getDatabase();
    await db.localAuth.put(account);
  }

  async delete(): Promise<void> {
    const db = getDatabase();
    await db.localAuth.delete(LOCAL_AUTH_ACCOUNT_ID);
  }
}
