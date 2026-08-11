import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreatePlotDto,
  UpdateGrowthStatusDto,
} from '../dtos/create-plot.dto';
import { PlotService } from '../services/plot.service';

@ApiTags('plots')
@Controller('api/v1/gis/plots')
export class PlotController {
  constructor(private readonly plotService: PlotService) {}

  @Post()
  @ApiOperation({ summary: 'UC-GIS-01/02: Số hóa ranh giới + cấp PUC + QR' })
  create(@Body() dto: CreatePlotDto) {
    return this.plotService.createPlot(dto);
  }

  @Get()
  @ApiOperation({ summary: 'GeoJSON FeatureCollection theo viewport BBOX' })
  @ApiQuery({
    name: 'bbox',
    required: false,
    description: 'minX,minY,maxX,maxY (EPSG:4326)',
  })
  list(@Query('bbox') bbox?: string) {
    return this.plotService.getPlotsGeoJson(bbox);
  }

  @Get('stats/risk')
  @ApiOperation({ summary: 'Thống kê rủi ro không gian' })
  riskSummary() {
    return this.plotService.getRiskSummary();
  }

  @Get('stats/crops')
  @ApiOperation({ summary: 'Thống kê diện tích theo loại cây' })
  cropStats() {
    return this.plotService.getCropStats();
  }

  @Get(':puc')
  @ApiOperation({ summary: 'Tra cứu công khai theo mã PUC' })
  getByPuc(@Param('puc') puc: string) {
    return this.plotService.getByPuc(puc);
  }

  @Patch(':puc/growth-status')
  @ApiOperation({ summary: 'UC-GIS-03: Cập nhật trạng thái sinh trưởng' })
  updateGrowth(
    @Param('puc') puc: string,
    @Body() dto: UpdateGrowthStatusDto,
  ) {
    return this.plotService.updateGrowthStatus(
      puc,
      dto.growth_status,
      dto.changed_by,
    );
  }
}
