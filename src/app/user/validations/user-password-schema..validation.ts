import * as JoiBase from 'joi';

import { CreateSchema } from '@app/@common/application/validators/joi/schemas/joi.create-schema.interface';
import joiMessagesSchema from '@app/@common/application/validators/joi/schemas/joi.messages.schema';

const Joi = JoiBase;

export class UserPasswordSchemaValidation implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
      passwordCurrent: Joi.string()
        .min(6)
        .max(30)
        .required()
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(joiMessagesSchema),
      repeatPasswordCurrent: Joi.string()
        .required()
        .valid(Joi.ref('passwordCurrent'))
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
