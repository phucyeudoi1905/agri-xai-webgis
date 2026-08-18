import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from '../decorators/public.decorator';
import { PlotClimateReadingEntity } from '../entities/plot-climate-reading.entity';
import { GisException } from '../common/gis.exception';
import { GisErrorCode } from '../common/enums';
import { HttpStatus } from '@nestjs/common';
import { PlotRepository } from '../repositories/plot.repository';

class ClimateReadingDto {
  @IsString()
  puc: string;

  @IsNumber()
  @Type(() => Number)
  temperature_c: number;

  @IsNumber()
  @Type(() => Number)
  humidity_pct: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sensor_id?: string;
}

@ApiTags('climate')
@Controller('api/v1/gis/climate')
export class ClimateController {
  constructor(
    @InjectRepository(PlotClimateReadingEntity)
    private readonly readings: Repository<PlotClimateReadingEntity>,
    private readonly plots: PlotRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'T24: Ghi nhận reading IoT (stub)' })
  async ingest(@Body() dto: ClimateReadingDto) {
    const plot = await this.plots.findByPuc(dto.puc);
    if (!plot) {
      throw new GisException(
        GisErrorCode.PUC_NOT_FOUND,
        'Không tìm thấy thông tin Mã vùng trồng.',
        HttpStatus.NOT_FOUND,
      );
    }
    const row = await this.readings.save(
      this.readings.create({
        puc: dto.puc,
        temperatureC: dto.temperature_c,
        humidityPct: dto.humidity_pct,
        sensorId: dto.sensor_id ?? null,
      }),
    );
    return { code: 'SUCCESS', data: row };
  }

  @Public()
  @Get(':puc')
  @ApiOperation({ summary: 'T24: Lịch sử vi khí hậu theo PUC' })
  async list(
    @Param('puc') puc: string,
    @Query('limit') limit = '50',
  ) {
    const take = Math.min(Number(limit) || 50, 200);
    const data = await this.readings.find({
      where: { puc },
      order: { recordedAt: 'DESC' },
      take,
    });
    return { code: 'SUCCESS', data };
  }
}
