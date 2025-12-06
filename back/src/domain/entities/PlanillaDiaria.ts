import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";
import { TipoMovimiento } from "./TipoMovimiento";
import { Cliente } from "./Cliente";
import { Moneda } from "./Moneda";

@Entity("planilla_diaria")
export class PlanillaDiaria extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "date" })
    fecha_operacion!: Date;

    // Relaciones Clave
    @ManyToOne(() => TipoMovimiento)
    tipo_movimiento!: TipoMovimiento;

    @ManyToOne(() => Cliente, { nullable: true })
    cliente!: Cliente | null;

    // El Core Atómico (Doble Entrada)
    // Para un "GASTO" simple, moneda_ingreso sería null y moneda_egreso tendría el valor del gasto.

    @ManyToOne(() => Moneda, { nullable: true })
    moneda_ingreso!: Moneda | null;

    @Column({ type: "decimal", precision: 18, scale: 4, default: 0 })
    monto_ingreso!: number;

    @ManyToOne(() => Moneda, { nullable: true })
    moneda_egreso!: Moneda | null;

    @Column({ type: "decimal", precision: 18, scale: 4, default: 0 })
    monto_egreso!: number;

    // Datos Financieros
    @Column({ type: "decimal", precision: 18, scale: 6, nullable: true })
    cotizacion_aplicada!: number | null;

    @Column({ type: "text", nullable: true })
    observaciones!: string | null;
}
