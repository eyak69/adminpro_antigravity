import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
} from "typeorm";

export abstract class AuditableEntity extends BaseEntity {
    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date;

    @Column({ nullable: true })
    created_by!: string;

    @Column({ nullable: true })
    updated_by!: string;
}
