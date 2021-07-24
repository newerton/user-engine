import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

@Catch(TypeError)
export class TypeErrorExceptionFilter implements RpcExceptionFilter {
  catch(exception: TypeError): Observable<any> {
    const error = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: TypeErrorExceptionFilter.name,
      message: exception.message,
      details: [
        {
          filter: TypeErrorExceptionFilter.name,
          exception: exception.constructor.name,
          ...exception,
        },
      ],
    };

    return throwError(JSON.stringify(error));
  }
}
