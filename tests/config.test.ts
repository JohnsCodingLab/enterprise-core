import { describe, it, expect } from "vitest";
import {
  requireString,
  requireNumber,
  requireBoolean,
  optionalString,
  optionalNumber,
  loadConfig,
  createConfigLoader,
  ConfigError,
} from "../src/index.js";

// ── Schema Validators ─────────────────────────────────────

describe("requireString", () => {
  it("should return the value for a valid string", () => {
    expect(requireString({ FOO: "bar" }, "FOO")).toBe("bar");
  });

  it("should throw ConfigError for missing key", () => {
    expect(() => requireString({}, "FOO")).toThrow(ConfigError);
  });

  it("should throw ConfigError for non-string value", () => {
    expect(() => requireString({ FOO: 123 }, "FOO")).toThrow(ConfigError);
  });

  it("should throw ConfigError for empty string", () => {
    expect(() => requireString({ FOO: "" }, "FOO")).toThrow(ConfigError);
  });
});

describe("requireNumber", () => {
  it("should parse a numeric string", () => {
    expect(requireNumber({ PORT: "3000" }, "PORT")).toBe(3000);
  });

  it("should return a number value directly", () => {
    expect(requireNumber({ PORT: 8080 }, "PORT")).toBe(8080);
  });

  it("should throw ConfigError for non-numeric string", () => {
    expect(() => requireNumber({ PORT: "abc" }, "PORT")).toThrow(ConfigError);
  });

  it("should throw ConfigError for missing key", () => {
    expect(() => requireNumber({}, "PORT")).toThrow(ConfigError);
  });
});

describe("requireBoolean", () => {
  it("should parse 'true' string", () => {
    expect(requireBoolean({ DEBUG: "true" }, "DEBUG")).toBe(true);
  });

  it("should parse 'false' string (case insensitive)", () => {
    expect(requireBoolean({ DEBUG: "FALSE" }, "DEBUG")).toBe(false);
  });

  it("should return boolean value directly", () => {
    expect(requireBoolean({ DEBUG: true }, "DEBUG")).toBe(true);
  });

  it("should throw ConfigError for invalid value", () => {
    expect(() => requireBoolean({ DEBUG: "yes" }, "DEBUG")).toThrow(
      ConfigError,
    );
  });
});

describe("optionalString", () => {
  it("should return the value if present", () => {
    expect(optionalString({ HOST: "localhost" }, "HOST", "0.0.0.0")).toBe(
      "localhost",
    );
  });

  it("should return default if missing", () => {
    expect(optionalString({}, "HOST", "0.0.0.0")).toBe("0.0.0.0");
  });
});

describe("optionalNumber", () => {
  it("should return the parsed value if present", () => {
    expect(optionalNumber({ PORT: "8080" }, "PORT", 3000)).toBe(8080);
  });

  it("should return default if missing", () => {
    expect(optionalNumber({}, "PORT", 3000)).toBe(3000);
  });

  it("should return default if NaN", () => {
    expect(optionalNumber({ PORT: "abc" }, "PORT", 3000)).toBe(3000);
  });
});

// ── Config Loaders ────────────────────────────────────────

describe("loadConfig", () => {
  it("should load a complete config from env vars", () => {
    const env = {
      JWT_ACCESS_SECRET: "access-secret",
      JWT_REFRESH_SECRET: "refresh-secret",
      PORT: "3000",
    };

    const config = loadConfig(env);

    expect(config.auth.jwt.accessTokenSecret).toBe("access-secret");
    expect(config.auth.jwt.refreshTokenSecret).toBe("refresh-secret");
    expect(config.auth.jwt.accessTokenTtl).toBe("15m"); // default
    expect(config.auth.jwt.refreshTokenTtl).toBe("7d"); // default
    expect(config.server.port).toBe(3000);
    expect(config.server.nodeEnv).toBe("development"); // default
  });

  it("should throw ConfigError for missing required vars", () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });
});

describe("createConfigLoader", () => {
  it("should create a custom config loader", () => {
    const loadMyConfig = createConfigLoader((env) => ({
      dbUrl: requireString(env, "DATABASE_URL"),
      port: requireNumber(env, "PORT"),
    }));

    const config = loadMyConfig({
      DATABASE_URL: "postgres://localhost:5432/mydb",
      PORT: "5432",
    });

    expect(config.dbUrl).toBe("postgres://localhost:5432/mydb");
    expect(config.port).toBe(5432);
  });

  it("should throw if required values are missing", () => {
    const loadMyConfig = createConfigLoader((env) => ({
      dbUrl: requireString(env, "DATABASE_URL"),
    }));

    expect(() => loadMyConfig({})).toThrow(ConfigError);
  });
});
