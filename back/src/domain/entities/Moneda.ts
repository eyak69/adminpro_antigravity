import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";

@Entity("monedas")
export class Moneda extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "char", length: 3, unique: true })
    codigo!: string;

    @Column({ type: "varchar", length: 50 })
    nombre!: string;

    @Column({ type: "varchar", length: 5 })
    simbolo!: string;

    @Column({ type: "boolean", default: false })
    es_nacional!: boolean;

    @Column({ type: "boolean", default: true })
    activa!: boolean;
}
