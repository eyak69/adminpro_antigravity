import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { AuditableEntity } from "./AuditableEntity";
import { Moneda } from "./Moneda";

@Entity("stock_caja")
@Index(["moneda"], { unique: true })
export class StockCaja extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Moneda, { nullable: false })
    @JoinColumn({ name: "moneda_id" })
    moneda!: Moneda;

    @Column({ type: "decimal", precision: 18, scale: 6 })
    saldo_actual!: number;
}
