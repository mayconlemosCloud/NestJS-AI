import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Invoice],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Invoice]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
