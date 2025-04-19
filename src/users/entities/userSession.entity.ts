export default class UserSession {
  id: number;
  userId: number;
  refreshToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}
