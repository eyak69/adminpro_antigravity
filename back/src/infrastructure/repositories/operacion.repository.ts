import { AppDataSource } from "../database/data-source";
import { Operacion } from "../../domain/entities/Operacion";
import { IOperacionRepository } from "../../domain/interfaces/IOperacionRepository";

export const OperacionRepository = AppDataSource.getRepository(Operacion).extend({
    async findAll(): Promise<Operacion[]> {
        return this.find();
    },
    async findById(id: number): Promise<Operacion | null> {
        return this.findOneBy({ id });
    },
});
