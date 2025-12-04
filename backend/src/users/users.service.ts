import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, SafeUser, UserWithRelations } from './types/user.types';

@Injectable()
export class UsersService {
  private readonly relationInclude = {
    roles: true,
    firm: true,
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.relationInclude,
    });
  }

  async findById(id: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.relationInclude,
    });
  }

  async createUser(input: CreateUserInput): Promise<UserWithRelations> {
    const roleNames = input.roleNames?.filter(Boolean) ?? [];
    const uniqueRoleNames = [...new Set(roleNames)];

    let roleConnections: { id: string }[] | undefined;

    if (uniqueRoleNames.length) {
      const roles = await this.prisma.role.findMany({
        where: { name: { in: uniqueRoleNames } },
        select: { id: true, name: true },
      });

      if (roles.length !== uniqueRoleNames.length) {
        throw new BadRequestException('One or more provided roles are invalid.');
      }

      roleConnections = roles.map((role) => ({ id: role.id }));
    }

    return this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: input.password,
        hashedRefreshToken: null,
        firm: input.firmId ? { connect: { id: input.firmId } } : undefined,
        roles: roleConnections ? { connect: roleConnections } : undefined,
      },
      include: this.relationInclude,
    });
  }

  async updateRefreshTokenHash(userId: string, hashedRefreshToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  sanitize(user: UserWithRelations | null): SafeUser | null {
    if (!user) {
      return null;
    }

    const { password: _password, hashedRefreshToken: _hashedRefreshToken, ...safeUser } = user;
    return safeUser as SafeUser;
  }
}
