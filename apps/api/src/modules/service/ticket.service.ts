import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { TicketRepository } from './repositories/ticket.repository';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { Ticket } from '@prisma/client';

@Injectable()
export class TicketService extends BaseService<
  Ticket,
  CreateTicketDto,
  UpdateTicketDto
> {
  constructor(protected readonly repository: TicketRepository) {
    super(repository);
  }

  async findByCase(caseId: number) {
    return this.repository.findByCase(caseId);
  }

  async findByStatus(status: string) {
    return this.repository.findByStatus(status);
  }

  async findByAssignedTo(assignedTo: number) {
    return this.repository.findByAssignedTo(assignedTo);
  }

  async resolve(id: number) {
    return this.repository.update(id, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
    } as UpdateTicketDto);
  }

  async close(id: number) {
    return this.repository.update(id, {
      status: 'CLOSED',
      closedAt: new Date(),
    } as UpdateTicketDto);
  }
}
