import { DataSource } from 'typeorm';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class TenantProvider {
  constructor(private readonly configService: ConfigService) {}
    
  private connections = new Map<string, DataSource>();

  getConnection(database: string): DataSource | undefined {
    if (this.connections.has(database)) {
      return this.connections.get(database)
    }

    const connection = new DataSource({
      username: this.configService.getOrThrow('POSTGRES_USER'),
      database: this.configService.getOrThrow('POSTGRES_DATABASE'),
      password: this.configService.getOrThrow('POSTGRES_PASSWORD'),
      host: this.configService.getOrThrow('POSTGRES_HOST'),
      port: this.configService.getOrThrow('POSTGRES_PORT'),
      type: 'postgres',
      logging: true,
    });

    this.connections.set(database, connection)
    return connection
  }
}