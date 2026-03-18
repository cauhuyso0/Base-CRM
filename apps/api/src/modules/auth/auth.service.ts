/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        isDeleted: false,
        isActive: true,
      },
      include: {
        company: true,
        branch: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    const roleCodes = user.userRoles.map((ur) => ur.role.code);
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.code),
        ),
      ),
    );
    const isSuperAdmin = roleCodes.includes('SUPER_ADMIN');

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      companyId: user.companyId,
      branchId: user.branchId,
      roles: user.userRoles.map((ur) => ur.role.name),
      roleCodes,
      permissions,
      isSuperAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: {
          id: user.company.id,
          name: user.company.name,
        },
        branch: user.branch
          ? {
              id: user.branch.id,
              name: user.branch.name,
            }
          : null,
        roles: user.userRoles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
          code: ur.role.code,
        })),
        permissions,
        isSuperAdmin,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if username exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: registerDto.username }, { email: registerDto.email }],
        isDeleted: false,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        companyId: registerDto.companyId,
        branchId: registerDto.branchId,
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
      },
      include: {
        company: true,
        branch: true,
      },
    });

    const employeeRole = await this.prisma.role.findFirst({
      where: {
        companyId: registerDto.companyId,
        code: 'EMPLOYEE',
        isDeleted: false,
      },
    });
    if (employeeRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: employeeRole.id,
        },
      });
    }

    const { password: _, ...result } = user;
    return result;
  }
}
