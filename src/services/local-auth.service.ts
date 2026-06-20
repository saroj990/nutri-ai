import {
  LOCAL_AUTH_ACCOUNT_ID,
  type AuthSession,
  type LocalAuthAccount,
} from "@/domain/entities/local-auth";
import type { LocalAuthRepository } from "@/domain/repositories/local-auth.repository";
import { hashPassword, verifyPassword } from "@/infrastructure/crypto/password";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/lib/auth-session";

export class LocalAuthService {
  constructor(private authRepo: LocalAuthRepository) {}

  async hasAccount(): Promise<boolean> {
    const account = await this.authRepo.get();
    return account != null;
  }

  getSession(): AuthSession | null {
    return readAuthSession();
  }

  isAuthenticated(): boolean {
    return this.getSession() != null;
  }

  async register(email: string, password: string): Promise<AuthSession> {
    const existing = await this.authRepo.get();
    if (existing) {
      throw new Error("An account already exists on this device");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { hash, salt } = await hashPassword(password);
    const now = new Date().toISOString();

    const account: LocalAuthAccount = {
      id: LOCAL_AUTH_ACCOUNT_ID,
      email: normalizedEmail,
      passwordHash: hash,
      salt,
      createdAt: now,
      updatedAt: now,
    };

    await this.authRepo.save(account);
    return this.createSession(normalizedEmail);
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const account = await this.authRepo.get();
    if (!account) {
      throw new Error("No account found. Create one first.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (account.email !== normalizedEmail) {
      throw new Error("Invalid email or password");
    }

    const valid = await verifyPassword(
      password,
      account.passwordHash,
      account.salt,
    );
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    return this.createSession(normalizedEmail);
  }

  logout(): void {
    clearAuthSession();
  }

  private createSession(email: string): AuthSession {
    const session: AuthSession = {
      email,
      issuedAt: new Date().toISOString(),
    };
    writeAuthSession(session);
    return session;
  }
}

export function createLocalAuthService(
  authRepo: LocalAuthRepository,
): LocalAuthService {
  return new LocalAuthService(authRepo);
}
