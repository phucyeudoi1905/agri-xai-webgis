import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateShippingLogDto } from '../dtos/create-plot.dto';
import { PlotService } from '../services/plot.service';

@ApiTags('shipping')
@Controller('api/v1/gis/shipping')
export class ShippingController {
  constructor(private readonly plotService: PlotService) {}

  @Post()
  @ApiOperation({ summary: 'UC-GIS-04: Nhật ký xuất xưởng + mã Batch' })
  create(@Body() dto: CreateShippingLogDto) {
    return this.plotService.createShippingLog(dto);
  }
}
