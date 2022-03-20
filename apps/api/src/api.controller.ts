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
import { createReadStream } from 'fs';
import { Db } from 'mongodb';

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
  async getEmployee(@Param('name') employeeName: string) {
    const employees = await this.db
      .collection('employee')
      .find({ name: employeeName })
      .toArray();
    return employees;
  }

  @Get('downloadPdf')
  @HttpCode(200)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=employeeInfo.pdf')
  async downloadPdf(@Param() employeeName: string) {
    return createReadStream(`${process.cwd()}/${employeeName}employeeName.pdf`);
  }
}
