import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { JoiValidationPipe } from './pipes/JoiValidation.pipe';
import { UserCreateSchema } from './validations/user.create.schema.validation';
import { AxiosResponse } from 'axios';
import { Headers } from './types/headers.types';
import { UserUpdateSchema } from './validations/user.update.schema.validation';
import { User } from './schemas/user.schema';
import { EmailSchema } from './validations/email.schema.validation';
import { ForgoPasswordDto } from './dtos/forgot-password.dto';
import { MessageResponse } from './types/messageResponse.types';
import { PasswordsSchema } from './validations/passwords.schema.validation';
import { ChangePasswordDto } from './dtos/change-password.dto';

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
}
