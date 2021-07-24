import { Catch, RpcExceptionFilter, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter implements RpcExceptionFilter<MongoError> {
  catch(exception: MongoError): Observable<any> {
    const error = {
      statusCode: HttpStatus.CONFLICT,
      error: MongoError.name,
      message: exception.errmsg,
      details: [{ filter: MongoExceptionFilter.name, ...exception }],
    };
    return throwError(JSON.stringify(error));
  }
}
