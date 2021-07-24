import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExceptionFilter } from './filters/rpc-exception.filter';
import { User, UserSchema } from './schemas/user.schema';
import { MongoExceptionFilter } from './filters/mongo-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { JoiValidationExceptionFilter } from './filters/joi.validation-exception.filter';
import { TypeErrorExceptionFilter } from './filters/typerror-exception.filter';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/users', {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: MongoExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeErrorExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: JoiValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
