import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FarmerService, toFarmerDto } from '../services/farmer.service';

@ApiTags('farmers')
@ApiBearerAuth('jwt')
@Controller('api/v1/gis/farmers')
export class FarmerController {
  constructor(private readonly farmers: FarmerService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách / tìm nông dân thành viên HTX' })
  async list(@Query('q') q?: string) {
    return { code: 'SUCCESS', data: await this.farmers.search(q) };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Tra cứu nông dân theo mã (ND-LD-0001)' })
  async byCode(@Param('code') code: string) {
    const row = await this.farmers.findByCode(code);
    return { code: 'SUCCESS', data: toFarmerDto(row) };
  }
}
