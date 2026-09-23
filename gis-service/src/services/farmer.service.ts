import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { GisErrorCode } from '../common/enums';
import { GisException } from '../common/gis.exception';
import { FarmerEntity } from '../entities/farmer.entity';
import { normalizeFarmerCode } from '../utils/crop-pattern.util';

export function toFarmerDto(row: FarmerEntity) {
  return {
    id: row.id,
    farmer_code: row.farmerCode,
    full_name: row.fullName,
    phone: row.phone,
    cooperative_name: row.cooperativeName,
    address_text: row.addressText,
  };
}

@Injectable()
export class FarmerService {
  constructor(
    @InjectRepository(FarmerEntity)
    private readonly farmers: Repository<FarmerEntity>,
  ) {}

  async findByCode(code: string): Promise<FarmerEntity> {
    const farmerCode = normalizeFarmerCode(code);
    const row = await this.farmers.findOne({ where: { farmerCode } });
    if (!row) {
      throw new GisException(
        GisErrorCode.FARMER_NOT_FOUND,
        `Không tìm thấy nông dân với mã ${farmerCode}.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async findById(id: string): Promise<FarmerEntity | null> {
    return this.farmers.findOne({ where: { id } });
  }

  async search(q?: string) {
    if (!q?.trim()) {
      const rows = await this.farmers.find({ take: 20, order: { farmerCode: 'ASC' } });
      return rows.map(toFarmerDto);
    }
    const term = q.trim();
    const rows = await this.farmers.find({
      where: [
        { farmerCode: ILike(`%${term.toUpperCase()}%`) },
        { fullName: ILike(`%${term}%`) },
      ],
      take: 20,
      order: { farmerCode: 'ASC' },
    });
    return rows.map(toFarmerDto);
  }
}
