export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenTtl: string; // e.g. "15m"
  refreshTokenTtl: string; // e.g. "7d"
}

export interface AuthConfig {
  jwt: JwtConfig;
}

export interface AppConfig {
  auth: AuthConfig;
}
