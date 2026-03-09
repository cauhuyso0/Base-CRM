import { Module } from '@nestjs/common';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { CaseRepository } from './repositories/case.repository';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketRepository } from './repositories/ticket.repository';

@Module({
  controllers: [CaseController, TicketController],
  providers: [CaseService, CaseRepository, TicketService, TicketRepository],
  exports: [CaseService, CaseRepository, TicketService, TicketRepository],
})
export class ServiceModule {}
