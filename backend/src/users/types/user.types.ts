import { Prisma } from '@prisma/client';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    roles: true;
    firm: true;
  };
}>;

export type SafeUser = Omit<UserWithRelations, 'password' | 'hashedRefreshToken'>;

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  firmId?: string;
  roleNames?: string[];
}
