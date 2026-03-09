export interface IBaseService<T, CreateDto, UpdateDto> {
  create(createDto: CreateDto): Promise<T>;
  findAll(filters?: any): Promise<T[]>;
  findOne(id: number): Promise<T>;
  findOneBy(where: Record<string, unknown>): Promise<T>;
  update(id: number, updateDto: UpdateDto): Promise<T>;
  remove(id: number): Promise<T>;
  count(filters?: any): Promise<number>;
}
