import * as JoiBase from 'joi';

import { CreateSchema } from '@app/@common/application/validators/joi/schemas/joi.create-schema.interface';
import joiMessagesSchema from '@app/@common/application/validators/joi/schemas/joi.messages.schema';

const Joi = JoiBase;

export class UserUpdateSchemaValidation implements CreateSchema {
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
        .messages(joiMessagesSchema),
      lastName: Joi.string()
        .label('Sobrenome')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(joiMessagesSchema),
    });
  }
}
