export type AccessTokenPayload = {
  userId: string;
  role?: string;
  permissions?: string[];
};

export type RefreshTokenPayload = {
  userId: string;
  tokenVersion: number;
};
