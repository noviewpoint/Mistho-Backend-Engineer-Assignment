import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

@Catch(MongoServerError)
export class MongoExceptionFilter<MongoServerError> implements ExceptionFilter {
  catch(exception: MongoServerError): void {
    throw new HttpException(exception, HttpStatus.BAD_REQUEST);
  }
}

// TODO - add specific filter for MongoBulkWriteError in the future
