import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceGateway } from './invoice.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'invoice-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, InvoiceGateway],
})
export class AppModule {}
