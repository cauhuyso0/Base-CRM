import { Controller, Get, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard/stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Get statistics for dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboardStats(@Request() req) {
    return await this.appService.getDashboardStats(
      req.user.companyId as number,
    );
  }
}
