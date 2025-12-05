import { Operacion } from "../entities/Operacion";

export interface IOperacionRepository {
    findAll(): Promise<Operacion[]>;
    findById(id: number): Promise<Operacion | null>;
    create(data: Partial<Operacion>): Promise<Operacion>;
}
