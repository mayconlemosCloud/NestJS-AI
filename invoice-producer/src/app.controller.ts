import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('invoices')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async createInvoice(@Body() data: any) {
    return this.appService.createInvoice(data);
  }
}
