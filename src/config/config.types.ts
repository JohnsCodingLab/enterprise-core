export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenTtl: string; // e.g. "15m"
  refreshTokenTtl: string; // e.g. "7d"
}

export interface AuthConfigSchema {
  jwt: JwtConfig;
}

export interface ServerConfig {
  port: number;
  nodeEnv: "development" | "production" | "test";
}

export interface AppConfig {
  auth: AuthConfigSchema;
  server: ServerConfig;
}
