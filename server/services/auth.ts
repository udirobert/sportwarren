import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(payload: any): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '7d',
      issuer: 'sportwarren',
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Auth0 integration methods
  async verifyAuth0Token(token: string): Promise<any> {
    // In a real implementation, you would verify the Auth0 JWT
    // For now, we'll just decode it (not secure for production)
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid Auth0 token');
    }
  }

  async createUserFromAuth0(auth0User: any): Promise<any> {
    return {
      id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name,
      avatar: auth0User.picture,
      auth0Id: auth0User.sub,
    };
  }

  // Session management
  generateSessionId(): string {
    return jwt.sign({ timestamp: Date.now() }, this.jwtSecret);
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      jwt.verify(sessionId, this.jwtSecret);
      return true;
    } catch (error) {
      return false;
    }
  }
}