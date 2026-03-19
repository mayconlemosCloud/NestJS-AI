import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async createInvoice(data: any) {
    const invoice = {
      ...data,
      id: Date.now().toString(),
      status: 'CREATED',
      createdAt: new Date().toISOString()
    };
    
    // Emit message to 'faturas.criadas' topic
    this.kafkaClient.emit('faturas.criadas', JSON.stringify(invoice));
    
    return { success: true, message: 'Invoice submitted to Kafka', invoice };
  }
}
