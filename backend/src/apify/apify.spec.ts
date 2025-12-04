import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('ApifyController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // Create a test user and get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/apify/scrape-profile (POST)', () => {
    it('should start a dry-run scraping job', () => {
      return request(app.getHttpServer())
        .post('/apify/scrape-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          instagramUrl: 'https://www.instagram.com/testuser',
          dryRun: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('runId');
          expect(res.body.runId).toMatch(/^dry-run-/);
          expect(res.body).toHaveProperty('message', 'Scraping job started');
        });
    });

    it('should validate Instagram URL format', () => {
      return request(app.getHttpServer())
        .post('/apify/scrape-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          instagramUrl: 'invalid-url',
          dryRun: true,
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/apify/scrape-profile')
        .send({
          instagramUrl: 'https://www.instagram.com/testuser',
          dryRun: true,
        })
        .expect(401);
    });
  });

  describe('/apify/run/:runId/status (GET)', () => {
    let runId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/apify/scrape-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          instagramUrl: 'https://www.instagram.com/testuser',
          dryRun: true,
        });

      runId = response.body.runId;
    });

    it('should return run status', () => {
      return request(app.getHttpServer())
        .get(`/apify/run/${runId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('runId', runId);
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('isDryRun', true);
        });
    });

    it('should return 404 for non-existent run', () => {
      return request(app.getHttpServer())
        .get('/apify/run/non-existent/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/apify/run/:runId/results (GET)', () => {
    let runId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/apify/scrape-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          instagramUrl: 'https://www.instagram.com/testuser',
          dryRun: true,
        });

      runId = response.body.runId;

      // Wait for dry run to complete
      await new Promise(resolve => setTimeout(resolve, 3500));
    });

    it('should return scraped results', () => {
      return request(app.getHttpServer())
        .get(`/apify/run/${runId}/results`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('profileData');
          expect(res.body).toHaveProperty('emails');
          expect(res.body.profileData).toHaveProperty('username');
          expect(res.body.profileData).toHaveProperty('fullName');
          expect(res.body.profileData).toHaveProperty('followersCount');
          expect(Array.isArray(res.body.emails)).toBe(true);
        });
    });

    it('should return 400 for incomplete run', async () => {
      const response = await request(app.getHttpServer())
        .post('/apify/scrape-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          instagramUrl: 'https://www.instagram.com/testuser2',
          dryRun: true,
        });

      const newRunId = response.body.runId;

      return request(app.getHttpServer())
        .get(`/apify/run/${newRunId}/results`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});