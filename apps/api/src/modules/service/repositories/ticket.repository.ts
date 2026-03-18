import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { Ticket } from '@prisma/client';
import { CreateTicketDto, UpdateTicketDto } from '../dto/ticket.dto';

@Injectable()
export class TicketRepository extends BaseRepository<
  Ticket,
  CreateTicketDto,
  UpdateTicketDto
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.ticket;
  }

  protected get include() {
    return {
      case: true,
      assignedUser: true,
      creator: true,
      activities: true,
      documents: true,
      notesList: true,
    };
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findByCase(caseId: number) {
    return this.model.findMany({
      where: { caseId, isDeleted: false },
      include: this.include,
    });
  }

  async findByStatus(status: string) {
    return this.model.findMany({
      where: { status, isDeleted: false },
      include: this.include,
    });
  }

  async findByAssignedTo(assignedTo: number) {
    return this.model.findMany({
      where: { assignedTo, isDeleted: false },
      include: this.include,
    });
  }
}
