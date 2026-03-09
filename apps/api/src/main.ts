import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
