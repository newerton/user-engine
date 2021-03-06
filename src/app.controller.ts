import { Controller } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JoiValidationPipe } from './pipes/JoiValidation.pipe';
import { AxiosResponse } from 'axios';
import { Headers } from './types/headers.types';
import { User } from './schemas/user.schema';
import { EmailSchema } from './validations/email.schema.validation';
import { ForgoPasswordDto } from './dtos/forgot-password.dto';
import { MessageResponse } from './types/messageResponse.types';
import { PasswordsSchema } from './validations/passwords.schema.validation';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { SearchUserDto } from './dtos/search-user.dto';
import { UserCreateSchema } from './validations/user-create.schema.validation';
import { UserUpdateSchema } from './validations/user-update.schema.validation';
import { UserSearchSchema } from './validations/user-search.schema.validation';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('users.create')
  async create(
    @Payload('payload', new JoiValidationPipe(new UserCreateSchema()))
    payload: CreateUserDto,
  ): Promise<AxiosResponse<User>> {
    return await this.appService.create(payload);
  }

  @MessagePattern('users.update')
  update(
    @Payload('payload', new JoiValidationPipe(new UserUpdateSchema()))
    payload: CreateUserDto,
    @Payload('headers')
    headers: Headers,
  ): Promise<AxiosResponse<User>> {
    return this.appService.update(payload, headers);
  }

  @MessagePattern('users.change_password')
  changePassword(
    @Payload('payload', new JoiValidationPipe(new PasswordsSchema()))
    payload: ChangePasswordDto,
    @Payload('headers')
    headers: Headers,
  ): Promise<void> {
    return this.appService.changePassword(payload, headers);
  }

  @MessagePattern('users.me')
  me(
    @Payload('headers')
    headers: Headers,
  ): Promise<AxiosResponse<User>> {
    return this.appService.me(headers);
  }

  @MessagePattern('users.forgot_password')
  forgotPassword(
    @Payload('payload', new JoiValidationPipe(new EmailSchema()))
    payload: ForgoPasswordDto,
  ): Promise<MessageResponse> {
    return this.appService.forgotPassword(payload);
  }

  @MessagePattern('users.find_one')
  findOne(
    @Payload(new JoiValidationPipe(new UserSearchSchema()))
    payload: SearchUserDto,
  ): Promise<User> {
    return this.appService.findOne(payload);
  }

  @MessagePattern('users.find_by_id')
  findById(payload: { id: string }): Promise<User> {
    return this.appService.findById(payload);
  }

  @EventPattern('product_created', Transport.KAFKA)
  async handleProductCreated(data: Record<string, unknown>) {
    console.log('product_created');
    console.log(data);
  }
}
