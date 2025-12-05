import { ClienteRepository } from "../../infrastructure/repositories/cliente.repository";
import { Cliente } from "../../domain/entities/Cliente";

export class ClienteService {
    async getAll(): Promise<Cliente[]> {
        return await ClienteRepository.find();
    }

    async getById(id: number): Promise<Cliente | null> {
        return await ClienteRepository.findById(id);
    }

    async getByAlias(alias: string): Promise<Cliente | null> {
        return await ClienteRepository.findByAlias(alias);
    }

    async create(data: Partial<Cliente>): Promise<Cliente> {
        const cliente = ClienteRepository.create(data);
        return await ClienteRepository.save(cliente);
    }

    async update(id: number, data: Partial<Cliente>): Promise<Cliente | null> {
        const cliente = await this.getById(id);
        if (!cliente) return null;
        ClienteRepository.merge(cliente, data);
        return await ClienteRepository.save(cliente);
    }

    async delete(id: number): Promise<boolean> {
        const result = await ClienteRepository.softDelete(id);
        return result.affected !== 0;
    }
}
