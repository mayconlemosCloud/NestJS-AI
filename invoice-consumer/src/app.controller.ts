import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('invoices')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('faturas.criadas')
  async handleInvoiceCreated(@Payload() message: any) {
    try {
      await this.appService.saveInvoice(message);
    } catch (e) {
      console.error('Erro ao lidar com fatura criadas:', e.message);
    }
  }

  @Get()
  async getInvoices() {
    return this.appService.getInvoices();
  }
}
