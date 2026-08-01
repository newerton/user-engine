import type { CreateValidationSchema } from "@app/@common/application/validators/zod/schemas";
import { z } from "zod";

export class UserEmailSchemaValidation implements CreateValidationSchema {
	createSchema(): z.ZodSchema {
		return z.object({
			email: z
				.string({
					description: "E-mail",
					required_error: "E-mail is required",
					invalid_type_error: "E-mail must be a string",
				})
				.toLowerCase()
				.email(),
		});
	}
}
