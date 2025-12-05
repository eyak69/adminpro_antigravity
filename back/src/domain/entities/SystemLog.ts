import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("system_logs")
export class SystemLog {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "enum",
        enum: ["info", "error", "success", "warning"],
        default: "info"
    })
    type!: "info" | "error" | "success" | "warning";

    @Column("text")
    message!: string;

    @CreateDateColumn()
    timestamp!: Date;
}
