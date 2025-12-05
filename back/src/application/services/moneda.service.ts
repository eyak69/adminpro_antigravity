import { MonedaRepository } from "../../infrastructure/repositories/moneda.repository";
import { Moneda } from "../../domain/entities/Moneda";

export class MonedaService {
    async getAll(): Promise<Moneda[]> {
        return await MonedaRepository.find();
    }

    async getById(id: number): Promise<Moneda | null> {
        return await MonedaRepository.findOneBy({ id });
    }

    async create(data: Partial<Moneda>): Promise<Moneda> {
        const moneda = MonedaRepository.create(data);
        return await MonedaRepository.save(moneda);
    }

    async update(id: number, data: Partial<Moneda>): Promise<Moneda | null> {
        const moneda = await this.getById(id);
        if (!moneda) return null;
        MonedaRepository.merge(moneda, data);
        return await MonedaRepository.save(moneda);
    }

    async delete(id: number): Promise<boolean> {
        const result = await MonedaRepository.softDelete(id);
        return result.affected !== 0;
    }
}
