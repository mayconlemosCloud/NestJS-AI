import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'storage-consumer-group',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(3002);
  console.log('✅ Storage Consumer rodando na porta HTTP 3002 e escutando Kafka!');
}
bootstrap();
