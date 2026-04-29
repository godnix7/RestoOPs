import { AuthService } from '../index';

describe('AuthService', () => {
  const secret = 'test-secret';

  it('should sign and verify an access token', () => {
    const payload = { userId: '123', role: 'owner', restaurantIds: ['r1'] };
    const token = AuthService.signAccessToken(payload, secret);
    const verified = AuthService.verifyToken(token, secret);
    expect(verified.userId).toBe('123');
    expect(verified.role).toBe('owner');
  });

  it('should sign a temporary MFA token', () => {
    const token = AuthService.signTempToken({ userId: '123', pendingMfa: true }, secret);
    const verified = AuthService.verifyToken(token, secret);
    expect(verified.userId).toBe('123');
    expect((verified as any).pendingMfa).toBe(true);
  });

  it('should fail verification for invalid token', () => {
    expect(() => AuthService.verifyToken('invalid', secret)).toThrow();
  });
});
