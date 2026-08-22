import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyGuard } from './common/api-key.guard';
import { RequestLoggingInterceptor } from './common/request-logging.interceptor';
import { AlertController } from './controllers/alert.controller';
import { ClimateController } from './controllers/climate.controller';
import { HealthController } from './controllers/health.controller';
import { PlotController } from './controllers/plot.controller';
import { ShippingController } from './controllers/shipping.controller';
import { GrowthStatusHistoryEntity } from './entities/growth-status-history.entity';
import { PlotClimateReadingEntity } from './entities/plot-climate-reading.entity';
import { PlotCropHistoryEntity } from './entities/plot-crop-history.entity';
import { PlotDiseaseAlertEntity } from './entities/plot-disease-alert.entity';
import { PlotEntity } from './entities/plot.entity';
import { PucSequenceEntity } from './entities/puc-sequence.entity';
import { ShippingLogEntity } from './entities/shipping-log.entity';
import { RiskGateway } from './gateways/risk.gateway';
import { PlotRepository } from './repositories/plot.repository';
import { PlotService } from './services/plot.service';
import { PucGeneratorService } from './services/puc-generator.service';
import { ReportService } from './services/report.service';
import { WeatherService } from './services/weather.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: Number(config.get('DATABASE_PORT', 5432)),
        username: config.get('DATABASE_USER', 'gis_admin'),
        password: config.get('DATABASE_PASSWORD', 'SecretPassword123'),
        database: config.get('DATABASE_NAME', 'gis_agriculture_db'),
        entities: [
          PlotEntity,
          ShippingLogEntity,
          PlotDiseaseAlertEntity,
          GrowthStatusHistoryEntity,
          PucSequenceEntity,
          PlotClimateReadingEntity,
          PlotCropHistoryEntity,
        ],
        synchronize: false,
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([
      PlotEntity,
      ShippingLogEntity,
      PlotDiseaseAlertEntity,
      GrowthStatusHistoryEntity,
      PucSequenceEntity,
      PlotClimateReadingEntity,
      PlotCropHistoryEntity,
    ]),
  ],
  controllers: [
    HealthController,
    PlotController,
    ShippingController,
    AlertController,
    ClimateController,
  ],
  providers: [
    PlotService,
    PucGeneratorService,
    PlotRepository,
    ReportService,
    WeatherService,
    RiskGateway,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
  ],
})
export class AppModule {}
