import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";
import { Cliente } from "./Cliente";
import { Moneda } from "./Moneda";

@Entity("cta_cte_saldos")
@Index(["cliente", "moneda"], { unique: true })
export class CtaCteSaldo extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Cliente)
    cliente!: Cliente;

    @ManyToOne(() => Moneda)
    moneda!: Moneda;

    @Column({ type: "decimal", precision: 18, scale: 4, default: 0 })
    saldo_actual!: number;
}
