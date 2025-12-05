import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('parametros')
export class Parametro {
    @PrimaryColumn({ length: 50 })
    clave!: string;

    @Column('text')
    valor!: string;

    @Column({ length: 255, nullable: true })
    descripcion?: string;
}
