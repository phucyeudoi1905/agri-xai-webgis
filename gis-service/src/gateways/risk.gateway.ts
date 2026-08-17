import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export interface RiskUpdatedPayload {
  puc: string;
  risk_level: number;
  risk_color: string;
  neighbors?: Array<{ puc: string; risk_level: number }>;
  source: 'disease-alert' | 'buffer' | 'manual';
  at: string;
}

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/gis',
})
export class RiskGateway implements OnGatewayInit {
  private readonly logger = new Logger(RiskGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('WebSocket namespace /gis ready (risk.updated)');
  }

  emitRiskUpdated(payload: RiskUpdatedPayload) {
    this.server?.emit('risk.updated', payload);
  }
}
