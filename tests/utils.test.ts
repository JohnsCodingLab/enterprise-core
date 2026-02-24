import { describe, it, expect, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createLogger,
  generateRequestId,
  extractBearerToken,
} from "../src/index.js";

// ── Password Hashing ─────────────────────────────────────

describe("hashPassword / verifyPassword", () => {
  it("should hash and verify a password", async () => {
    const password = "my-secure-password-123!";
    const hash = await hashPassword(password);

    expect(hash).toBeTypeOf("string");
    expect(hash).toContain(":"); // salt:hash format

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject wrong passwords", async () => {
    const hash = await hashPassword("correct-password");
    const isValid = await verifyPassword("wrong-password", hash);
    expect(isValid).toBe(false);
  });

  it("should produce different hashes for the same password (random salt)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });

  it("should return false for malformed hash strings", async () => {
    const isValid = await verifyPassword("password", "not-a-valid-hash");
    expect(isValid).toBe(false);
  });
});

// ── Logger ────────────────────────────────────────────────

describe("createLogger", () => {
  it("should create a logger with all methods", () => {
    const logger = createLogger({ service: "test-service" });

    expect(logger.debug).toBeTypeOf("function");
    expect(logger.info).toBeTypeOf("function");
    expect(logger.warn).toBeTypeOf("function");
    expect(logger.error).toBeTypeOf("function");
  });

  it("should output structured JSON", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = createLogger({ service: "my-api" });

    logger.info("Server started", { port: 3000 });

    expect(spy).toHaveBeenCalledOnce();
    const output = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(output.level).toBe("info");
    expect(output.message).toBe("Server started");
    expect(output.service).toBe("my-api");
    expect(output.port).toBe(3000);
    expect(output.timestamp).toBeDefined();

    spy.mockRestore();
  });

  it("should respect log level filtering", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const logger = createLogger({ level: "info" }); // info and above

    logger.debug("This should be filtered");
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});

// ── Request ID / Bearer Token ─────────────────────────────

describe("generateRequestId", () => {
  it("should return a UUID string", () => {
    const id = generateRequestId();
    expect(id).toBeTypeOf("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("should return unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe("extractBearerToken", () => {
  it("should extract token from valid Authorization header", () => {
    expect(extractBearerToken("Bearer abc123")).toBe("abc123");
  });

  it("should return null for undefined header", () => {
    expect(extractBearerToken(undefined)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(extractBearerToken("")).toBeNull();
  });

  it("should return null for non-Bearer scheme", () => {
    expect(extractBearerToken("Basic abc123")).toBeNull();
  });

  it("should return null for malformed header", () => {
    expect(extractBearerToken("Bearer")).toBeNull();
    expect(extractBearerToken("Bearer a b c")).toBeNull();
  });
});
