import {
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream, ReadStream } from 'fs';
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

  @Get('downloadPdf')
  @HttpCode(200)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=employeeInfo.pdf')
  async downloadPdf(@Param() employeeName: string): Promise<ReadStream> {
    return createReadStream(`${process.cwd()}/${employeeName}employeeName.pdf`);
  }
}
