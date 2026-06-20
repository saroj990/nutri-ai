export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "CONFLICT" | "STORAGE_QUOTA" | "UNKNOWN",
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}
