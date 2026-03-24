import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Invoice } from './invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite', // Caminho corrigido para o volume Docker
      entities: [Invoice],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Invoice]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'invoice-updater-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
