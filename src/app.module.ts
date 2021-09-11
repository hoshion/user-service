import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as env from 'dotenv';

env.config();

@Module({
  imports: [
    ClientsModule.register([{
      name: "USER_SERVICE",
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`],
        queue: process.env.RABBITMQ_QUEUE_NAME,
        queueOptions: {
          durable: false
        },
      }
    }])
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
