import { z } from 'zod';

import { CreateValidationSchema } from '@app/@common/application/validators/zod/schemas';

export class UserUpdateSchemaValidation implements CreateValidationSchema {
  createSchema(): z.ZodSchema {
    return z.object({
      firstName: z.string({
        description: 'First name',
        required_error: 'First name is required',
        invalid_type_error: 'First name must be a string',
      }),
      lastName: z.string({
        description: 'Last name',
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string',
      }),
    });
  }
}
