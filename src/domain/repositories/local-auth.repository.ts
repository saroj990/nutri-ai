import type { LocalAuthAccount } from "../entities/local-auth";

export interface LocalAuthRepository {
  get(): Promise<LocalAuthAccount | null>;
  save(account: LocalAuthAccount): Promise<void>;
  delete(): Promise<void>;
}
