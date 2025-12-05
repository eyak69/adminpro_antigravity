import { Cliente } from "../entities/Cliente";

export interface IClienteRepository {
    findById(id: number): Promise<Cliente | null>;
    findByAlias(alias: string): Promise<Cliente | null>;
    create(cliente: Partial<Cliente>): Promise<Cliente>;
    update(id: number, cliente: Partial<Cliente>): Promise<Cliente | null>;
}
