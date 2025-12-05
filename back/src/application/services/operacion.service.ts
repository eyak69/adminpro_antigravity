import { OperacionRepository } from "../../infrastructure/repositories/operacion.repository";
import { Operacion } from "../../domain/entities/Operacion";

export class OperacionService {
    async getAll(): Promise<Operacion[]> {
        return await OperacionRepository.findAll();
    }

    async getById(id: number): Promise<Operacion | null> {
        return await OperacionRepository.findById(id);
    }

    async create(data: Partial<Operacion>): Promise<Operacion> {
        const operacion = OperacionRepository.create(data);
        return await OperacionRepository.save(operacion);
    }

    async update(id: number, data: Partial<Operacion>): Promise<Operacion | null> {
        const operacion = await this.getById(id);
        if (!operacion) return null;
        OperacionRepository.merge(operacion, data);
        return await OperacionRepository.save(operacion);
    }

    async delete(id: number): Promise<boolean> {
        const result = await OperacionRepository.softDelete(id);
        return result.affected !== 0;
    }
}
