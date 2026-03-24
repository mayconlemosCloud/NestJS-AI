import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('faturas.salvas')
  async handleInvoiceSaved(@Payload() message: any) {
    await this.appService.processInvoice(message);
  }
}
