import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor,
} from "@nestjs/common";
import type { Request } from "express";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
	public intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<void> {
		const request: Request = context.switchToHttp().getRequest();
		const requestStartDate: number = Date.now();

		if (request.method && request.path) {
			return next.handle().pipe(tap(this.tapLogger(request, requestStartDate)));
		} else {
			return next.handle();
		}
	}

	public tapLogger(request: Request, requestStartDate: number) {
		return (): void => {
			const message: string = this.message(request, requestStartDate);
			Logger.log(message, HttpLoggingInterceptor.name);
		};
	}

	public message(request: Request, requestStartDate: number) {
		const requestFinishDate: number = Date.now();
		const message: string =
			`Method: ${request.method}; ` +
			`Path: ${request.path}; ` +
			`SpentTime: ${requestFinishDate - requestStartDate}ms`;

		return message;
	}
}
