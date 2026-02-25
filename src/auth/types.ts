export type AccessTokenPayload = {
    userId: string;
    role?: string | undefined;
    permissions?: string[] | undefined;
};

export type RefreshTokenPayload = {
    userId: string;
    tokenVersion: number;
    jti?: string | undefined;
};
