export const jwtConfig = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
        expiresIn: '15m'
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
        expiresIn: '7d'
    }
};
