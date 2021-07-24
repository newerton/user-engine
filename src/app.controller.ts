import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JoiValidationPipe } from './pipes/JoiValidation.pipe';
import { UserCreateSchema } from './validations/user.create.schema.validation';
import { AxiosResponse } from 'axios';
import { Headers } from './types/headers.types';
import { UserUpdateSchema } from './validations/user.update.schema.validation';
import { User } from './schemas/user.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('users.create')
  async create(
    @Payload('user', new JoiValidationPipe(new UserCreateSchema()))
    user: CreateUserDto,
  ): Promise<AxiosResponse<User>> {
    return await this.appService.create(user);
  }

  @MessagePattern('users.update')
  update(
    @Payload('user', new JoiValidationPipe(new UserUpdateSchema()))
    user: CreateUserDto,
    @Payload('headers')
    headers: Headers,
  ): Promise<AxiosResponse<User>> {
    return this.appService.update(user, headers);
  }

  @MessagePattern('users.me')
  me(
    @Payload('headers')
    headers: Headers,
  ): Promise<AxiosResponse<User>> {
    return this.appService.me(headers);
  }
}
