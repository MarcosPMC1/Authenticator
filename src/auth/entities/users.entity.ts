import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string

    @Column({ type: 'varchar', length: 60 })
    password: string

    @Column({ type: 'boolean', default: false })
    email_verification: boolean

    @CreateDateColumn()
    createdAt: Date
}
