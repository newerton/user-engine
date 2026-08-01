import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import type { User } from '@app/user/schemas/user.schema';
import type { UserMeUseCase } from '@app/user/use-cases/user-me.use-case';
import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { AxiosRequestHeaders, AxiosResponse } from 'axios';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserMeController {
  constructor(private readonly useCase: UserMeUseCase) {}

  @MessagePattern('users.me')
  execute(
    @Payload('headers')
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse<User>> {
    return this.useCase.execute(headers);
  }
}
