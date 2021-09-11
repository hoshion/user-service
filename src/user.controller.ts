import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { EntryPayload } from './entry.payload';
import { ReturnModel } from './return.model';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern("log-in-user")
  login(@Payload() data: EntryPayload): Promise<ReturnModel> {
    return this.userService.login(data);
  }

  @MessagePattern("register-user")
  async register(@Payload() data: EntryPayload): Promise<ReturnModel> {
    
    return this.userService.register(data);
  }
}
