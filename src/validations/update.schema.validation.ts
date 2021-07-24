import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

const Joi = JoiBase;

export class UpdateUserSchema implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
      id: Joi.string()
        .label('ID')
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages(MessagesSchema),
      user: Joi.object({
        first_name: Joi.string()
          .label('Nome')
          .error((errors: any) => {
            errors.forEach((err: JoiBase.ErrorReport) => {
              console.log('err.code', err);
            });
            return errors;
          })
          .messages(MessagesSchema),
        last_name: Joi.string()
          .label('Sobre nome')
          .error((errors: any) => {
            errors.forEach((err: JoiBase.ErrorReport) => {
              console.log('err.code', err);
            });
            return errors;
          })
          .messages(MessagesSchema),
      })
        .required()
        .error((errors: any) => {
          errors.forEach((err: JoiBase.ErrorReport) => {
            console.log('err.code', err);
          });
          return errors;
        }),
    });
  }
}
