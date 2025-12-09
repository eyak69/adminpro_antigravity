import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";

@Entity("clientes")
export class Cliente extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    @Index() // Indexed for fast search by alias
    alias!: string;

    @Column({ type: "varchar", length: 150, nullable: true })
    nombre_real!: string | null;

    @Column({ type: "varchar", length: 20, nullable: true })
    documento!: string | null;

    @Column({ type: "text", nullable: true })
    notas!: string | null;

    @Column({ type: "boolean", default: false })
    es_moroso!: boolean;

    @Column({ type: "boolean", default: false })
    es_vip!: boolean; // Si es true, sus movimientos impactan en el StockCaja

    // TODO: Add OneToMany relation with CuentaCorriente
    // @OneToMany(() => CuentaCorriente, (cc) => cc.cliente)
    // cuentasCorrientes: CuentaCorriente[];
}
