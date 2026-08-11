import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiseaseAlertDto } from '../dtos/create-plot.dto';
import { PlotService } from '../services/plot.service';

@ApiTags('alerts')
@Controller('api/v1/gis/plots')
export class AlertController {
  constructor(private readonly plotService: PlotService) {}

  @Post('disease-alert')
  @ApiOperation({
    summary: 'UC-GIS-05: Tiếp nhận cảnh báo dịch bệnh & đổi màu bản đồ',
  })
  receive(@Body() dto: DiseaseAlertDto) {
    return this.plotService.receiveDiseaseAlert(dto);
  }
}
