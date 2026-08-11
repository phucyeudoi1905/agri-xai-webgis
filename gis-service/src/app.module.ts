import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertController } from './controllers/alert.controller';
import { PlotController } from './controllers/plot.controller';
import { ShippingController } from './controllers/shipping.controller';
import { GrowthStatusHistoryEntity } from './entities/growth-status-history.entity';
import { PlotDiseaseAlertEntity } from './entities/plot-disease-alert.entity';
import { PlotEntity } from './entities/plot.entity';
import { PucSequenceEntity } from './entities/puc-sequence.entity';
import { ShippingLogEntity } from './entities/shipping-log.entity';
import { PlotRepository } from './repositories/plot.repository';
import { PlotService } from './services/plot.service';
import { PucGeneratorService } from './services/puc-generator.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ]),
  ],
  controllers: [PlotController, ShippingController, AlertController],
  providers: [PlotService, PucGeneratorService, PlotRepository],
})
export class AppModule {}
