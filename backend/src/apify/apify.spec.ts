import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('ApifyController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Create agent to maintain cookies across requests
    agent = request.agent(app.getHttpServer());

    // Register a test user
    const registerRes = await agent.post('/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    // Check if registration was successful
    if (registerRes.status !== 201 && registerRes.status !== 200) {
      throw new Error(
        `Registration failed with status ${registerRes.status}: ${JSON.stringify(registerRes.body)}`
      );
    }
    // Cookies are automatically maintained by the agent
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/apify/scrape-profile (POST)', () => {
    it('should start a dry-run scraping job', () => {
      return agent
        .post('/apify/scrape-profile')
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
      return agent
        .post('/apify/scrape-profile')
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
    it('should return run status', async () => {
      const response = await agent.post('/apify/scrape-profile').send({
        instagramUrl: 'https://www.instagram.com/testuser',
        dryRun: true,
      });

      const runId = response.body.runId;

      return agent
        .get(`/apify/run/${runId}/status`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('runId', runId);
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('isDryRun', true);
        });
    });

    it('should return 404 for non-existent run', () => {
      return agent.get('/apify/run/non-existent/status').expect(404);
    });
  });

  describe('/apify/run/:runId/results (GET)', () => {
    it('should return scraped results', async () => {
      const response = await agent.post('/apify/scrape-profile').send({
        instagramUrl: 'https://www.instagram.com/testuser',
        dryRun: true,
      });

      const runId = response.body.runId;

      // Wait for dry run to complete
      await new Promise((resolve) => setTimeout(resolve, 3500));

      return agent
        .get(`/apify/run/${runId}/results`)
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

    it.skip('should return 400 for incomplete run', async () => {
      const response = await agent.post('/apify/scrape-profile').send({
        instagramUrl: 'https://www.instagram.com/testuser2',
        dryRun: true,
      });

      const newRunId = response.body.runId;

      return agent.get(`/apify/run/${newRunId}/results`).expect(400);
    });
  });
});
