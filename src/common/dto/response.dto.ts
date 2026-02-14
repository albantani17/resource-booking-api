import { IsString } from 'class-validator';

export class ResponseDto {
  @IsString()
  status: string;

  @IsString()
  message: string;

  data: any;

  constructor({
    status,
    message,
    data,
  }: {
    status: string;
    message: string;
    data: any;
  }) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export class ReturnPaginationDto {
  @IsString()
  status: string;

  @IsString()
  message: string;

  data: any[];

  meta: {
    total: number;
    page: number;
    limit: number;
  };

  constructor({
    status,
    message,
    data,
    meta,
  }: {
    status: string;
    message: string;
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
