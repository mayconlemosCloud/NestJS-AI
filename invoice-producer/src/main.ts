import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita CORS para o Frontend independente
  app.enableCors();

  // Conecta como um microserviço Kafka também (para ouvir as respostas)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'invoice-producer-gateway-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('🚀 Invoice Producer & WS Gateway ready on port 3001');
}
bootstrap();
