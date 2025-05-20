import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from './tenant.service';
import { Request } from 'express';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantService: TenantService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (typeof tenantId !== 'string') {
      throw new BadRequestException('Tenant ID must be a string');
    }

    const tenant = await this.tenantService.getTenantById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    request['tenant'] = tenant.id;

    return next.handle();
  }
}