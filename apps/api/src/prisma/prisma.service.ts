import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public readonly prisma: PrismaClient;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    const prismaWithQueryEvent = this as PrismaClient & {
      $on(
        eventType: 'query',
        callback: (event: Prisma.QueryEvent) => void,
      ): void;
    };

    prismaWithQueryEvent.$on('query', (e: Prisma.QueryEvent) => {
      let parsedParams: unknown = e.params;
      try {
        parsedParams = JSON.parse(e.params);
      } catch {
        parsedParams = e.params;
      }
      console.log(
        '[Prisma Query Bound]',
        this.bindQueryParams(e.query, parsedParams),
      );
    });
  }

  private bindQueryParams(query: string, params: unknown): string {
    if (!Array.isArray(params)) {
      return query;
    }
    const paramList = params as unknown[];

    let idx = 0;
    return query.replace(/\?/g, () => {
      const value = paramList[idx];
      idx += 1;
      return this.formatSqlValue(value);
    });
  }

  private formatSqlValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    if (value instanceof Date) {
      return `'${value.toISOString().replace('T', ' ').replace('Z', '')}'`;
    }
    if (typeof value === 'string') {
      return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
    }

    const json = JSON.stringify(value);
    return `'${json.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
