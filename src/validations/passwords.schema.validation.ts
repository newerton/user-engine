import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

const Joi = JoiBase;

export class PasswordsSchema implements CreateSchema {
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
        .messages(MessagesSchema),
      repeatPasswordCurrent: Joi.string()
        .required()
        .valid(Joi.ref('passwordCurrent'))
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
