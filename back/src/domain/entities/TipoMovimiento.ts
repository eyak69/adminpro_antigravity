import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditableEntity } from "./AuditableEntity";
import { Operacion } from "./Operacion";
import { Moneda } from "./Moneda";

export enum AccionMovimiento {
    COMPRA = "COMPRA",
    VENTA = "VENTA",
    ENTRADA = "ENTRADA",
    SALIDA = "SALIDA",
    NEUTRO = "NEUTRO",
}

export enum Contabilizacion {
    ENTRADA = "ENTRADA",
    SALIDA = "SALIDA",
}

@Entity("tipos_movimiento")
export class TipoMovimiento extends AuditableEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    nombre!: string;

    @Column({ type: "enum", enum: AccionMovimiento, nullable: true })
    tipo_accion!: AccionMovimiento | null;

    @Column({ type: "enum", enum: Contabilizacion, nullable: true })
    contabilizacion!: Contabilizacion | null;

    // Flags booleanos
    @Column({ type: "boolean", default: false })
    requiere_persona!: boolean;

    @Column({ type: "boolean", default: false })
    es_persona_obligatoria!: boolean;

    @Column({ type: "boolean", default: false })
    requiere_cotizacion!: boolean;

    @Column({ type: "boolean", default: false })
    lleva_observacion!: boolean;

    @Column({ type: "boolean", default: false })
    graba_cta_cte!: boolean;

    // Relaciones
    @ManyToOne(() => Operacion, (operacion) => operacion.tipos_movimiento)
    operacion!: Operacion;

    @ManyToMany(() => Moneda)
    @JoinTable({
        name: "tipomovimiento_moneda", // Nombre de la tabla intermedia
        joinColumn: { name: "tipo_movimiento_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "moneda_id", referencedColumnName: "id" },
    })
    monedas_permitidas!: Moneda[];
}
