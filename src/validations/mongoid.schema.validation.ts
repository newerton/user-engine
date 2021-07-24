import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

const Joi = JoiBase;

export class ParamsMongoIdSchema implements CreateSchema {
  createSchema(): JoiBase.NumberSchema {
    return Joi.number()
      .integer()
      .positive()
      .required()
      .label('ID')
      .error((errors: any) => {
        errors.forEach((err: JoiBase.ErrorReport) => {
          console.log('err.code', err);
        });
        return errors;
      })
      .messages(MessagesSchema);
  }
}
