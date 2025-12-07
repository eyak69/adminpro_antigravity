import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";
import { Cliente } from "./Cliente";
import { Moneda } from "./Moneda";
import { PlanillaDiaria } from "./PlanillaDiaria";
import { TipoMovimientoCtaCte } from "../enums/TipoMovimientoCtaCte";

@Entity("cta_cte_movimientos")
export class CtaCteMovimiento extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "date" })
    fecha_operacion!: Date;

    @ManyToOne(() => Cliente)
    cliente!: Cliente;

    @ManyToOne(() => Moneda)
    moneda!: Moneda;


    /* Legacy fields removed: tipo, monto, cotizacion_aplicada */

    @Column({ type: "decimal", precision: 18, scale: 4, default: 0 })
    monto_ingreso!: number;

    @Column({ type: "decimal", precision: 18, scale: 4, default: 0 })
    monto_egreso!: number;

    @Column({ type: "text", nullable: true })
    observaciones!: string | null;

    // El Vínculo con la Caja
    @ManyToOne(() => PlanillaDiaria, { nullable: true })
    planilla_asociada!: PlanillaDiaria | null;
}
