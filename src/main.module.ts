import { Module, Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { HttpLoggingInterceptor } from '@app/@common/application/interceptors/http-logging.interceptor';
import { AuthModule } from '@app/auth/auth.module';
import { UserModule } from '@app/user/user.module';
import { ApiServerConfig } from '@core/@shared/infrastructure/config/env/api-server.config';

import { MainController } from './main.controller';

const providers: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: RemoteProcedureCallExceptionFilter,
  },
];

if (ApiServerConfig.LOG_ENABLE) {
  providers.push({
    provide: APP_INTERCEPTOR,
    useClass: HttpLoggingInterceptor,
  });
}

@Module({
  imports: [AuthModule, UserModule],
  controllers: [MainController],
  providers,
})
export class MainModule {}
