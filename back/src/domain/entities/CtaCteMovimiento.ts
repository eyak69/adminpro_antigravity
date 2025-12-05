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

    @Column({ type: "datetime" })
    fecha_operacion!: Date;

    @Column({ type: "enum", enum: TipoMovimientoCtaCte })
    tipo!: TipoMovimientoCtaCte;

    @ManyToOne(() => Cliente)
    cliente!: Cliente;

    @ManyToOne(() => Moneda)
    moneda!: Moneda;

    @Column({ type: "decimal", precision: 18, scale: 4 })
    monto!: number;

    @Column({ type: "decimal", precision: 18, scale: 6, nullable: true })
    cotizacion_aplicada!: number | null;

    @Column({ type: "text", nullable: true })
    observaciones!: string | null;

    // El Vínculo con la Caja
    @ManyToOne(() => PlanillaDiaria, { nullable: true })
    planilla_asociada!: PlanillaDiaria | null;
}
