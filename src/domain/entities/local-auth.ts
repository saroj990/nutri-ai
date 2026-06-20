export const LOCAL_AUTH_ACCOUNT_ID = "default" as const;

export type LocalAuthAccountId = typeof LOCAL_AUTH_ACCOUNT_ID;

export interface LocalAuthAccount {
  id: LocalAuthAccountId;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  email: string;
  issuedAt: string;
}
