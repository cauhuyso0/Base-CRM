import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseService } from '../interfaces/service.interface';
import { BaseRepository } from '../repositories/base.repository';

@Injectable()
export abstract class BaseService<
  T,
  CreateDto,
  UpdateDto,
> implements IBaseService<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly repository: BaseRepository<T, CreateDto, UpdateDto>,
  ) {}

  async create(createDto: CreateDto): Promise<T> {
    return this.repository.create(createDto);
  }

  async findAll(filters?: any): Promise<T[]> {
    return this.repository.findAll(filters);
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async findOneBy(where: Record<string, unknown>): Promise<T> {
    const entity = await this.repository.findOneBy(where);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateDto): Promise<T> {
    await this.findOne(id); // Check if exists
    return this.repository.update(id, updateDto);
  }

  async remove(id: number): Promise<T> {
    await this.findOne(id); // Check if exists
    return this.repository.remove(id);
  }

  async count(filters?: any): Promise<number> {
    return this.repository.count(filters);
  }
}
