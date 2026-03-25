import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  CreateIncomeDto,
  CreateExpenseDto,
  CreateMenuItemDto,
  CreateQrOrderDto,
  CreateRestaurantTableDto,
  CreateTaxRuleDto,
  UpdateMenuItemDto,
  UpsertBusinessSettingDto,
  UpdateOrderStatusDto,
} from './dto/restaurant.dto';
import { RestaurantService } from './restaurant.service';

@ApiTags('restaurant')
@ApiBearerAuth('JWT-auth')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  private resolveCompanyId(req: any, fallback?: number): number {
    if (req.user?.isSuperAdmin && fallback) {
      return fallback;
    }
    return Number(req.user?.companyId);
  }

  @Get('tables')
  listTables(@Request() req: any, @Query('companyId') companyId?: string) {
    return this.restaurantService.listTables(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
    );
  }

  @Post('tables')
  createTable(
    @Request() req: any,
    @Body() dto: CreateRestaurantTableDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.createTable(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      dto,
    );
  }

  @Get('menu-items')
  listMenuItems(@Request() req: any, @Query('companyId') companyId?: string) {
    return this.restaurantService.listMenuItems(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
    );
  }

  @Post('menu-items')
  createMenuItem(
    @Request() req: any,
    @Body() dto: CreateMenuItemDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.createMenuItem(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      dto,
    );
  }

  @Patch('menu-items/:id')
  updateMenuItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.updateMenuItem(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      id,
      dto,
    );
  }

  @Delete('menu-items/:id')
  removeMenuItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.removeMenuItem(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      id,
    );
  }

  @Public()
  @Get('qr/:token/menu')
  getQrMenu(@Param('token') token: string) {
    return this.restaurantService.getQrMenu(token);
  }

  @Public()
  @Post('qr/:token/orders')
  createQrOrder(
    @Param('token') token: string,
    @Body() dto: CreateQrOrderDto,
  ) {
    return this.restaurantService.createOrderFromQr(token, dto);
  }

  @Get('orders')
  listOrders(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.listOrders(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      status,
      from,
      to,
    );
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.updateOrderStatus(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      id,
      dto.status,
    );
  }

  @Get('expenses')
  listExpenses(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.listExpenses(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      from,
      to,
    );
  }

  @Post('expenses')
  createExpense(
    @Request() req: any,
    @Body() dto: CreateExpenseDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.createExpense(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      dto,
    );
  }

  @Post('incomes')
  createIncome(
    @Request() req: any,
    @Body() dto: CreateIncomeDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.createIncome(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      dto,
    );
  }

  @Get('cashflow')
  listCashFlow(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('direction') direction?: string,
    @Query('sourceModule') sourceModule?: string,
    @Query('businessCategory') businessCategory?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.listCashFlow(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      from,
      to,
      direction,
      sourceModule,
      businessCategory,
    );
  }

  @Get('tax-rules')
  listTaxRules(@Request() req: any, @Query('companyId') companyId?: string) {
    return this.restaurantService.listTaxRules(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
    );
  }

  @Post('tax-rules')
  createTaxRule(
    @Request() req: any,
    @Body() dto: CreateTaxRuleDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.createTaxRule(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      dto,
    );
  }

  @Get('dashboard')
  dashboard(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.getDashboard(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      from,
      to,
    );
  }

  @Get('tax-summary')
  getTaxSummary(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('businessCategory') businessCategory?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.getTaxSummary(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      from,
      to,
      businessCategory,
    );
  }

  @Get('business-setting')
  getBusinessSetting(@Request() req: any, @Query('companyId') companyId?: string) {
    return this.restaurantService.getBusinessSetting(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
    );
  }

  @Post('business-setting')
  upsertBusinessSetting(
    @Request() req: any,
    @Body() dto: UpsertBusinessSettingDto,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.upsertBusinessSetting(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      dto,
    );
  }

  @Get('notifications')
  listNotifications(@Request() req: any, @Query('companyId') companyId?: string) {
    return this.restaurantService.listNotifications(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
    );
  }

  @Patch('notifications/:id/read')
  markNotificationRead(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Query('companyId') companyId?: string,
  ) {
    return this.restaurantService.markNotificationRead(
      this.resolveCompanyId(req, companyId ? Number(companyId) : undefined),
      id,
    );
  }
}
