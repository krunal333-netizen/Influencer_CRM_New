import { SafeUser } from '../../users/types/user.types';
import { AuthTokens } from './auth-tokens.interface';

export interface AuthResult {
  user: SafeUser;
  tokens: AuthTokens;
}
