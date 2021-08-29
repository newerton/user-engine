import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

const Joi = JoiBase;

export class UserSearchSchema implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
      firstName: Joi.string()
        .label('Primeiro nome')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(MessagesSchema),
      lastName: Joi.string()
        .label('Sobrenome')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(MessagesSchema),
      email: Joi.string()
        .email()
        .lowercase()
        .label('E-mail')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(MessagesSchema),
    });
  }
}
