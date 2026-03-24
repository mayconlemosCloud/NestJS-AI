import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InvoiceGateway } from './invoice.gateway';

@Controller('invoices')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly gateway: InvoiceGateway
  ) {}

  @Post()
  async createInvoice(@Body() data: any) {
    return this.appService.createInvoice(data);
  }

  // Escuta todos os eventos do Kafka para repassar ao Frontend via WebSocket
  @MessagePattern('faturas.criadas')
  handleCreated(@Payload() message: any) {
    this.gateway.emitEvent('invoice_created', message);
  }

  @MessagePattern('faturas.salvas')
  handleSaved(@Payload() message: any) {
    this.gateway.emitEvent('invoice_saved', message);
  }

  @MessagePattern('faturas.processadas')
  handleProcessed(@Payload() message: any) {
    this.gateway.emitEvent('invoice_processed', message);
  }
}
