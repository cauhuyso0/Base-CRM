import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type ResourceConfig = {
  model?: keyof PrismaService;
  hasCompanyId?: boolean;
};

type AuthenticatedUser = {
  companyId: number;
  permissions?: string[];
  isSuperAdmin?: boolean;
};

type HttpRequest = {
  baseUrl?: string;
  originalUrl?: string;
  url?: string;
  path?: string;
  method?: string;
  user?: AuthenticatedUser;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  params: Record<string, unknown>;
  route?: { path?: string };
};

const RESOURCE_CONFIG: Record<string, ResourceConfig> = {
  companies: { model: 'company', hasCompanyId: false },
  branches: { model: 'branch', hasCompanyId: true },
  customers: { model: 'customer', hasCompanyId: true },
  opportunities: { model: 'opportunity', hasCompanyId: true },
  sales_orders: { model: 'salesOrder', hasCompanyId: true },
  campaigns: { model: 'campaign', hasCompanyId: true },
  leads: { model: 'lead', hasCompanyId: true },
  cases: { model: 'case', hasCompanyId: true },
  tickets: { model: 'ticket', hasCompanyId: false },
  products: { model: 'product', hasCompanyId: true },
  vendors: { model: 'vendor', hasCompanyId: true },
  accounts: { model: 'account', hasCompanyId: true },
};

const CONTROLLER_RESOURCE_MAP: Record<string, string> = {
  CompanyController: 'companies',
  BranchController: 'branches',
  CustomerController: 'customers',
  OpportunityController: 'opportunities',
  SalesController: 'sales_orders',
  CampaignController: 'campaigns',
  LeadController: 'leads',
  CaseController: 'cases',
  TicketController: 'tickets',
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<HttpRequest>();
    const user = request.user;
    if (!user) return true;

    const resource = this.resolveResource(context, request);
    const action = this.resolveAction(request.method || '');
    if (!resource || !action) return true;

    if (!user.isSuperAdmin) {
      this.enforceCompanyScope(request, resource, user.companyId);
      await this.enforceEntityOwnership(request, resource, user.companyId);
      await this.enforceRelatedEntityScope(request, user.companyId);
    }

    if (user.isSuperAdmin) return true;

    const permissionCode = `${resource}.${action}`;
    if (!user.permissions?.includes(permissionCode)) {
      throw new ForbiddenException(`Missing permission: ${permissionCode}`);
    }

    return true;
  }

  private resolveResource(
    context: ExecutionContext,
    request: HttpRequest,
  ): string | null {
    const controllerName = context.getClass().name;
    const mappedResource = CONTROLLER_RESOURCE_MAP[controllerName];
    if (mappedResource && RESOURCE_CONFIG[mappedResource]) {
      return mappedResource;
    }

    const candidates = [
      request.baseUrl,
      request.originalUrl,
      request.path,
      request.url,
    ].filter((v): v is string => Boolean(v));

    for (const candidate of candidates) {
      const cleanPath = candidate.split('?')[0];
      const segments = cleanPath.split('/').filter(Boolean);
      const apiIndex = segments.indexOf('api');
      const endpoint =
        apiIndex >= 0 ? segments[apiIndex + 1] : segments[segments.length - 1];
      if (!endpoint) continue;
      const normalized = endpoint.replace(/-/g, '_');
      if (RESOURCE_CONFIG[normalized]) {
        return normalized;
      }
    }

    return null;
  }

  private resolveAction(
    method: string,
  ): 'create' | 'read' | 'update' | 'delete' | null {
    const map: Record<string, 'create' | 'read' | 'update' | 'delete'> = {
      GET: 'read',
      POST: 'create',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
    };
    return map[method] || null;
  }

  private enforceCompanyScope(
    request: {
      query: Record<string, unknown>;
      body: Record<string, unknown>;
      params: Record<string, unknown>;
      route?: { path?: string };
    },
    resource: string,
    companyId: number,
  ) {
    const config = RESOURCE_CONFIG[resource];
    if (!config) return;

    if (resource === 'companies') {
      const routePath = request.route?.path || '';
      if (
        routePath === '' ||
        routePath === '/' ||
        routePath === 'count' ||
        routePath === 'find-one'
      ) {
        request.query.id = companyId;
      }
      if (request.params?.id && Number(request.params.id) !== companyId) {
        throw new ForbiddenException('Cross-company access denied');
      }
      return;
    }

    if (
      request.params.companyId !== undefined &&
      Number(request.params.companyId) !== companyId
    ) {
      throw new ForbiddenException('Cross-company route is not allowed');
    }

    if (!config.hasCompanyId) return;

    if (
      request.query.companyId !== undefined &&
      Number(request.query.companyId) !== companyId
    ) {
      throw new ForbiddenException('Cross-company query is not allowed');
    }

    request.query.companyId = companyId;

    if (
      request.body?.companyId !== undefined &&
      Number(request.body.companyId) !== companyId
    ) {
      throw new ForbiddenException('Cross-company payload is not allowed');
    }
  }

  private async enforceRelatedEntityScope(
    request: {
      params: Record<string, unknown>;
      query: Record<string, unknown>;
      body?: Record<string, unknown>;
    },
    companyId: number,
  ) {
    const checks: Array<{
      key: string;
      model:
        | 'customer'
        | 'branch'
        | 'campaign'
        | 'lead'
        | 'opportunity'
        | 'salesOrder'
        | 'case';
    }> = [
      { key: 'customerId', model: 'customer' },
      { key: 'branchId', model: 'branch' },
      { key: 'campaignId', model: 'campaign' },
      { key: 'leadId', model: 'lead' },
      { key: 'opportunityId', model: 'opportunity' },
      { key: 'salesOrderId', model: 'salesOrder' },
      { key: 'caseId', model: 'case' },
    ];

    for (const check of checks) {
      const rawValue =
        request.params[check.key] ??
        request.query[check.key] ??
        request.body?.[check.key];
      const id = Number(rawValue);
      if (!Number.isFinite(id)) continue;

      const model = this.prisma[check.model] as unknown as {
        findUnique: (args: {
          where: { id: number };
          select: { companyId: boolean };
        }) => Promise<{ companyId: number } | null>;
      };
      const record = await model.findUnique({
        where: { id },
        select: { companyId: true },
      });
      if (record && record.companyId !== companyId) {
        throw new ForbiddenException(
          'Cross-company related entity is not allowed',
        );
      }
    }
  }

  private async enforceEntityOwnership(
    request: {
      params: Record<string, unknown>;
    },
    resource: string,
    companyId: number,
  ) {
    const id = Number(request.params?.id);
    if (!Number.isFinite(id)) return;

    if (resource === 'companies') {
      if (id !== companyId) {
        throw new ForbiddenException('Cross-company access denied');
      }
      return;
    }

    const config = RESOURCE_CONFIG[resource];
    if (!config?.model || !config.hasCompanyId) return;

    const model = this.prisma[config.model] as unknown as {
      findUnique: (args: {
        where: { id: number };
        select: { companyId: boolean };
      }) => Promise<{ companyId: number } | null>;
    };
    const record = await model.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (record && record.companyId !== companyId) {
      throw new ForbiddenException('Cross-company access denied');
    }
  }
}
