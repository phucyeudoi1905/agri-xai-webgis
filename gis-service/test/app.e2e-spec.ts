import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('GIS Service (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/gis/plots returns FeatureCollection', () => {
    return request(app.getHttpServer())
      .get('/api/v1/gis/plots?bbox=105,10,106,11')
      .expect(200)
      .expect((res) => {
        expect(res.body.type).toBe('FeatureCollection');
        expect(Array.isArray(res.body.features)).toBe(true);
      });
  });
});
