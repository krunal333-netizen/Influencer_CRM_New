export interface JwtPayload {
  sub: string;
  email: string;
  firmId?: string | null;
  roles: string[];
  tokenType?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
