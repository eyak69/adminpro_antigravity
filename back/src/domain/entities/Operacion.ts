import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";
import { TipoMovimiento } from "./TipoMovimiento";

@Entity("operaciones")
export class Operacion extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    nombre!: string;

    // Relation to TipoMovimiento
    @OneToMany(() => TipoMovimiento, (tipo) => tipo.operacion)
    tipos_movimiento!: TipoMovimiento[];
}
