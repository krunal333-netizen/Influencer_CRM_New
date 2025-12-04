import { User, Role, Firm } from '@prisma/client';

export type UserWithRelations = User & {
  roles: Role[];
  firm?: Firm | null;
};

export type SafeUser = Omit<UserWithRelations, 'password' | 'hashedRefreshToken'>;

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  firmId?: string;
  roleNames?: string[];
}
