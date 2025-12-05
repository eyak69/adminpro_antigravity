import { AppDataSource } from "../database/data-source";
import { Cliente } from "../../domain/entities/Cliente";
import { IClienteRepository } from "../../domain/interfaces/IClienteRepository";

export const ClienteRepository = AppDataSource.getRepository(Cliente).extend({
    async findById(id: number): Promise<Cliente | null> {
        return this.findOneBy({ id });
    },
    async findByAlias(alias: string): Promise<Cliente | null> {
        return this.findOneBy({ alias });
    },
});
