import type { UserProfile } from "../entities/user-profile";

export interface UserProfileRepository {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  delete(): Promise<void>;
}
