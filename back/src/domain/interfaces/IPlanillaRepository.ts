import { PlanillaDiaria } from "../entities/PlanillaDiaria";

export interface IPlanillaRepository {
    create(transaccion: Partial<PlanillaDiaria>): Promise<PlanillaDiaria>;
    findByDateRange(start: Date, end: Date): Promise<PlanillaDiaria[]>;
    findByCliente(clienteId: number): Promise<PlanillaDiaria[]>;
}
