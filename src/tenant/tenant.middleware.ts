import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { TenantService } from "./tenant.service";

export class TentantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID is required' });
    }

    if(typeof tenantId !== 'string') {
      return res.status(400).json({ message: 'Tenant ID must be a string' });
    }

    const tenant = await this.tenantService.getTenantById(tenantId);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    req['tenant'] = tenant;
    next();
  }
}