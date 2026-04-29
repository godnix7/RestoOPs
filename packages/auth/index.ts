import jwt from 'jsonwebtoken';
import * as otplib from 'otplib';
const { authenticator } = otplib as any;
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';

export interface TokenPayload {
  userId: string;
  role: string;
  organizationId?: string;
  restaurantIds: string[];
  jti?: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static signAccessToken(payload: TokenPayload, secret: string): string {
    return jwt.sign(payload, secret, { expiresIn: this.ACCESS_TOKEN_EXPIRY as any });
  }

  static signRefreshToken(payload: TokenPayload, secret: string): string {
    return jwt.sign(payload, secret, { expiresIn: this.REFRESH_TOKEN_EXPIRY as any });
  }

  static signTempToken(payload: { userId: string; pendingMfa: boolean }, secret: string): string {
    return jwt.sign(payload, secret, { expiresIn: '5m' });
  }

  static verifyToken(token: string, secret: string): TokenPayload {
    return jwt.verify(token, secret) as TokenPayload;
  }

  static async generateMfaSecret(email: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, 'RestroOps', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    return { secret, qrCodeUrl };
  }

  static verifyMfaToken(token: string, secret: string) {
    return authenticator.check(token, secret);
  }
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPS_MANAGER: 'ops_manager',
  OWNER: 'owner',
  MANAGER: 'manager',
  ADVISOR: 'advisor',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
