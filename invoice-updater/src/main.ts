import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'invoice-updater-group',
      },
    },
  });
  
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log('🤖 AI Invoice Updater (Consumer 2) ready on port 3003');
}
bootstrap();
