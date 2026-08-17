import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  Equals,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class GeoJsonPolygonDto {
  @Equals('Polygon')
  type: 'Polygon';

  @IsArray()
  @ArrayMinSize(1)
  coordinates: number[][][];
}

export class CreatePlotDto {
  @IsUUID()
  farmer_id: string;

  @IsString()
  @MaxLength(100)
  plot_name: string;

  @IsString()
  @MaxLength(50)
  crop_type: string;

  @ValidateNested()
  @Type(() => GeoJsonPolygonDto)
  boundary: GeoJsonPolygonDto;
}

export class UpdateGrowthStatusDto {
  @IsString()
  growth_status: string;

  @IsUUID()
  changed_by: string;
}

export class CreateShippingLogDto {
  @IsString()
  puc: string;

  @IsString()
  harvest_date: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @MaxLength(150)
  destination: string;
}

export class DiseaseAlertDto {
  @IsString()
  puc: string;

  @IsString()
  @MaxLength(100)
  disease_name: string;

  @IsNumber()
  @Type(() => Number)
  confidence: number;

  @IsOptional()
  @IsString()
  xai_overlay_url?: string;

  /** Optional override; default maps confidence → risk_level */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  risk_level?: number;
}

export class ImportFeatureDto {
  @Equals('Feature')
  type: 'Feature';

  @ValidateNested()
  @Type(() => GeoJsonPolygonDto)
  geometry: GeoJsonPolygonDto;

  @IsOptional()
  properties?: {
    plot_name?: string;
    crop_type?: string;
    farmer_id?: string;
  };
}

export class ImportGeoJsonDto {
  @Equals('FeatureCollection')
  type: 'FeatureCollection';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportFeatureDto)
  features: ImportFeatureDto[];

  @IsOptional()
  @IsUUID()
  default_farmer_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  default_crop_type?: string;
}
