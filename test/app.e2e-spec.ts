import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // Example: Add more e2e tests for your endpoints
  it('/tenant (GET) - should require authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/tenant');
    expect([401, 403]).toContain(response.status);
  });

  it('/tenant (POST) - should validate body', async () => {
    const response = await request(app.getHttpServer())
      .post('/tenant')
      .send({});
    expect(response.status).toBe(400);
  });
});
