import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

const Joi = JoiBase;

export class CreateUserSchema implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
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
      email: Joi.string()
        .email()
        .lowercase()
        .label('E-mail')
        .error((errors: any) => {
          errors.forEach((err: JoiBase.ErrorReport) => {
            console.log('err.code', err);
          });
          return errors;
        })
        .messages(MessagesSchema),
      password_current: Joi.string()
        .min(6)
        .max(30)
        .required()
        .label('Senha')
        .error((errors: any) => {
          errors.forEach((err: JoiBase.ErrorReport) => {
            console.log('err.code', err);
          });
          return errors;
        })
        .messages(MessagesSchema),
      repeat_password_current: Joi.string()
        .required()
        .valid(Joi.ref('password_current'))
        .label('Repita a senha')
        .error((errors: any) => {
          errors.forEach((err: JoiBase.ErrorReport) => {
            switch (err.code) {
              case 'any.only':
                err.message =
                  '"Repetir a senha" precisa ser idêntico a "Senha"';
                break;
              default:
                break;
            }
          });
          return errors;
        })
        .messages(MessagesSchema),
      device_token: Joi.string(),
    });
  }
}
