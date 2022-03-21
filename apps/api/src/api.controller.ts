import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { constants, createReadStream, ReadStream } from 'fs';
import { access } from 'fs/promises';
import { Db } from 'mongodb';
import { Employee } from '../../../libs/interfaces';

@ApiTags('api')
@Controller('api')
export class ApiController {
  constructor(
    private readonly appService: ApiService,
    @Inject('MESSAGE_BROKER_CLIENT') private client: ClientProxy,
    @Inject('DATABASE_CLIENT')
    private db: Db,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @HttpCode(202)
  async scrape(): Promise<string> {
    await this.client.emit({ cmd: 'scrape' }, 'glassdoor');
    return 'OK';
  }

  @Get('employee/:name')
  async getEmployee(@Param('name') employeeName: string): Promise<Employee[]> {
    const employees = (await this.db
      .collection('employee')
      .find({ name: employeeName })
      .toArray()) as unknown[] as Employee[];
    return employees;
  }

  @Get('employee/download/:employeeName')
  @HttpCode(200)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=employeeInformation.pdf')
  async downloadEmployeeFile(
    @Param('employeeName') employeeName: string,
  ): Promise<ReadStream> {
    // TODO - better handling of error
    const filePath = `${process.cwd()}/${employeeName}.pdf`;
    try {
      await access(filePath, constants.F_OK);
      return createReadStream(`${process.cwd()}/${employeeName}.pdf`);
    } catch (ex) {
      throw new HttpException(
        'Problem while downloading the requested file.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
