import { BaseFilterOptions } from '../repositories/base.repository';

export interface IRepository<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;
  findAll(filters?: BaseFilterOptions): Promise<T[]>;
  findOne(id: number): Promise<T | null>;
  findOneBy(where: Record<string, unknown>): Promise<T | null>;
  update(id: number, data: UpdateDto): Promise<T>;
  remove(id: number): Promise<T>;
  count(filters?: BaseFilterOptions): Promise<number>;
  exists(id: number): Promise<boolean>;
}
