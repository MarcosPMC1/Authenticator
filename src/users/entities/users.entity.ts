import { TenantUsers } from '../../tenant/entity/tenant-users.entity';
import { Role } from '../../enums/role.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60 })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role

  @CreateDateColumn()
  createdAt: Date;
  
  @DeleteDateColumn()
  deletedAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @OneToMany(() => TenantUsers, (tenantUsers) => tenantUsers.user)
  tenants: TenantUsers[];
}
