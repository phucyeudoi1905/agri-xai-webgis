import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { DataSource } from 'typeorm';

@Injectable()
export class PucGeneratorService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  /** Format: VN-[TỈNH]-[NĂM]-[######] e.g. VN-ST-2026-000123 */
  async generateNextPuc(): Promise<string> {
    const province = this.config.get<string>('PUC_PROVINCE_CODE', 'ST');
    const year = new Date().getFullYear();

    return this.dataSource.transaction(async (manager) => {
      const rows: unknown = await manager.query(
        `INSERT INTO puc_sequences (province_code, year, last_value)
         VALUES ($1, $2, 1)
         ON CONFLICT (province_code, year)
         DO UPDATE SET last_value = puc_sequences.last_value + 1
         RETURNING last_value`,
        [province, year],
      );

      const list = Array.isArray(rows) ? rows : [];
      const first = list[0] as Record<string, unknown> | undefined;
      const raw =
        first?.last_value ??
        first?.lastValue ??
        (first ? Object.values(first)[0] : undefined);
      const seq = Number(raw);
      if (!Number.isFinite(seq) || seq < 1) {
        throw new Error(
          `Không sinh được số thứ tự PUC (payload: ${JSON.stringify(rows)})`,
        );
      }
      const serial = String(seq).padStart(6, '0');
      return `VN-${province}-${year}-${serial}`;
    });
  }

  async generateQrCode(puc: string): Promise<{ qrPath: string; publicUrl: string }> {
    const storageDir = path.resolve(
      this.config.get<string>('QR_STORAGE_PATH', './storage/qr'),
    );
    await fs.mkdir(storageDir, { recursive: true });

    const fileName = `${puc}.png`;
    const qrPath = path.join(storageDir, fileName);
    const baseUrl = this.config.get<string>(
      'PUBLIC_BASE_URL',
      'http://localhost:4000',
    );
    const lookupUrl = `${baseUrl.replace(/\/$/, '')}/puc/${puc}`;

    await QRCode.toFile(qrPath, lookupUrl, {
      type: 'png',
      width: 512,
      margin: 2,
    });

    return {
      qrPath,
      publicUrl: `${baseUrl.replace(/\/$/, '')}/storage/qr/${fileName}`,
    };
  }
}
