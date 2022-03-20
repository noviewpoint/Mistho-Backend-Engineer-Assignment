import {
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'fs';

@ApiTags('api')
@Controller('api')
export class ApiController {
  constructor(
    private readonly appService: ApiService,
    @Inject('MESSAGE_BROKER_CLIENT') private client: ClientProxy,
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

  @Get('downloadPdf')
  @HttpCode(200)
  @Header('Content-Type', 'application/pdf')
  @Header(
    'Content-Disposition',
    'attachment; filename=Ravi_Van_server_copy.pdf.pdf',
  )
  async downloadPdf() {
    return createReadStream(`${process.cwd()}/Ravi_Van.pdf`);
  }
}
