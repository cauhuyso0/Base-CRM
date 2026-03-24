import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function parseCorsOrigins(): string[] {
  const raw = process.env.FRONTEND_URL?.trim();
  if (!raw) {
    return ['http://localhost:3000'];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isOriginInAllowList(origin: string, allowList: string[]): boolean {
  try {
    const originHost = new URL(origin).hostname;
    return allowList.some((allowed) => {
      if (allowed === origin) {
        return true;
      }
      if (allowed.startsWith('.')) {
        return originHost === allowed.slice(1) || originHost.endsWith(allowed);
      }
      try {
        return new URL(allowed).origin === origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/** Cho phép dev truy cập API từ điện thoại / máy khác cùng LAN (QR, IP Wi‑Fi). */
function isDevPrivateNetworkOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  if (process.env.CORS_STRICT_LAN === 'true') {
    return false;
  }
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true;
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true;
    }
    if (hostname.endsWith('.trycloudflare.com')) {
      return true;
    }
    const m = /^172\.(\d{1,3})\./.exec(hostname);
    if (m) {
      const n = Number(m[1]);
      if (n >= 16 && n <= 31) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';

  const allowedList = parseCorsOrigins();

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      if (isOriginInAllowList(requestOrigin, allowedList)) {
        callback(null, true);
        return;
      }
      if (isDevPrivateNetworkOrigin(requestOrigin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  app.setGlobalPrefix(globalPrefix);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Base CRM API')
    .setDescription('API documentation for Base CRM system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('companies', 'Company management')
    .addTag('branches', 'Branch management')
    .addTag('customers', 'Customer management')
    .addTag('contacts', 'Contact management')
    .addTag('products', 'Product management')
    .addTag('vendors', 'Vendor management')
    .addTag('warehouses', 'Warehouse management')
    .addTag('accounts', 'Account management')
    .addTag('campaigns', 'Marketing campaigns')
    .addTag('leads', 'Lead management')
    .addTag('opportunities', 'Sales opportunities')
    .addTag('sales-orders', 'Sales orders')
    .addTag('cases', 'Service cases')
    .addTag('tickets', 'Support tickets')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  const bindLabel = host === '0.0.0.0' ? '0.0.0.0 (all interfaces)' : host;
  console.log(`🚀 API listening on http://${bindLabel}:${port}`);
  console.log(
    `   LAN: dùng http://<IP-máy-tính>:${port} từ điện thoại cùng Wi‑Fi`,
  );
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
