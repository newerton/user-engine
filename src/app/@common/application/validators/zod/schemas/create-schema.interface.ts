import type z from "zod";

export interface CreateValidationSchema {
	createSchema(): z.Schema;
}
