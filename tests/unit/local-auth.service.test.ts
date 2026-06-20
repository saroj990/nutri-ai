import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBLocalAuthRepository } from "@/repositories/indexeddb/local-auth.repository";
import { createLocalAuthService } from "@/services/local-auth.service";
import { hashPassword, verifyPassword } from "@/infrastructure/crypto/password";
import { clearAuthSession, readAuthSession } from "@/lib/auth-session";
import { getDatabase, resetDatabaseForTesting } from "@/infrastructure/database/nutriai-db";

describe("password crypto", () => {
  it("hashes and verifies passwords", async () => {
    const { hash, salt } = await hashPassword("my-secure-password");
    expect(await verifyPassword("my-secure-password", hash, salt)).toBe(true);
    expect(await verifyPassword("wrong-password", hash, salt)).toBe(false);
  });
});

describe("LocalAuthService", () => {
  let service: ReturnType<typeof createLocalAuthService>;

  beforeEach(async () => {
    resetDatabaseForTesting();
    clearAuthSession();
    await getDatabase().open();
    service = createLocalAuthService(new IndexedDBLocalAuthRepository());
  });

  afterEach(async () => {
    clearAuthSession();
    await getDatabase().delete();
  });

  it("registers and logs in a local account", async () => {
    expect(await service.hasAccount()).toBe(false);

    const registered = await service.register("user@example.com", "password123");
    expect(registered.email).toBe("user@example.com");
    expect(readAuthSession()?.email).toBe("user@example.com");

    service.logout();
    expect(service.isAuthenticated()).toBe(false);

    const loggedIn = await service.login("user@example.com", "password123");
    expect(loggedIn.email).toBe("user@example.com");
  });

  it("rejects duplicate registration", async () => {
    await service.register("user@example.com", "password123");
    await expect(
      service.register("other@example.com", "password123"),
    ).rejects.toThrow(/already exists/i);
  });

  it("rejects invalid login", async () => {
    await service.register("user@example.com", "password123");
    service.logout();
    await expect(
      service.login("user@example.com", "wrong-password"),
    ).rejects.toThrow(/invalid/i);
  });
});
