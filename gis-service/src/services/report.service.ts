import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { PlotService } from './plot.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly plots: PlotService,
    private readonly config: ConfigService,
  ) {}

  async buildPlotPdf(puc: string): Promise<Buffer> {
    const res = await this.plots.getByPuc(puc);
    const d = res.data as {
      plot_name: string;
      puc: string;
      crop_type: string;
      area_ha: number;
      area_m2: number;
      growth_status: string;
      risk_level: number;
      farmer_id: string;
      created_at: string | Date;
      qr_code_url?: string | null;
      alerts?: Array<{
        diseaseName: string;
        confidence: number;
        status: string;
        alertDate: string | Date;
      }>;
      shipments?: Array<{
        batchCode: string;
        quantity: number;
        unit: string;
        destination: string;
        harvestDate: string;
      }>;
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const base = this.config.get('PUBLIC_BASE_URL', 'http://localhost:4000');

      doc.fontSize(18).text('Hồ sơ vùng trồng (PUC)', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Tên lô: ${d.plot_name}`);
      doc.text(`Mã PUC: ${d.puc}`);
      doc.text(`Cây trồng: ${d.crop_type}`);
      doc.text(`Diện tích: ${d.area_ha} ha (${d.area_m2} m²)`);
      doc.text(`Sinh trưởng: ${d.growth_status}`);
      doc.text(`Rủi ro: level ${d.risk_level}`);
      doc.text(`Farmer ID: ${d.farmer_id}`);
      doc.text(`Ngày tạo: ${d.created_at}`);
      if (d.qr_code_url) doc.text(`QR: ${d.qr_code_url}`);
      doc.text(`Tra cứu: ${base}/puc/${d.puc}`);

      doc.moveDown();
      doc.fontSize(13).text('Cảnh báo dịch bệnh', { underline: true });
      doc.fontSize(10);
      if (!d.alerts?.length) {
        doc.text('Không có cảnh báo.');
      } else {
        for (const a of d.alerts) {
          doc.text(
            `- ${a.diseaseName} · ${a.confidence}% · ${a.status} · ${a.alertDate}`,
          );
        }
      }

      doc.moveDown();
      doc.fontSize(13).text('Xuất xưởng', { underline: true });
      doc.fontSize(10);
      if (!d.shipments?.length) {
        doc.text('Chưa có lô hàng.');
      } else {
        for (const s of d.shipments) {
          doc.text(
            `- ${s.batchCode}: ${s.quantity} ${s.unit} → ${s.destination} (${s.harvestDate})`,
          );
        }
      }

      doc.moveDown();
      doc.fontSize(9).fillColor('#666').text('AgriLens GIS · Nhóm 2 · Agri XAI');
      doc.end();
    });
  }
}
