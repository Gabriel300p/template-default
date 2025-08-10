import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/v1/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'healthy');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('version');
          expect(typeof res.body.uptime).toBe('number');
          expect(res.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });

    it('should return consistent response format', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      // Both responses should have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(
        Object.keys(response2.body).sort()
      );

      // Uptime should increase between calls
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });

    it('should include proper headers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-request-id');
        });
    });
  });

  describe('/api/v1/health/detailed (GET)', () => {
    it('should return detailed health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/detailed')
        .expect((res) => {
          // Should return 200 for healthy or 503 for unhealthy
          expect([200, 503]).toContain(res.status);
          
          if (res.status === 200) {
            expect(res.body).toHaveProperty('status', 'ok');
            expect(res.body).toHaveProperty('info');
            expect(res.body).toHaveProperty('details');
          }
        });
    });

    it('should include component health checks', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/detailed')
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body.details).toHaveProperty('memory_heap');
            expect(res.body.details).toHaveProperty('memory_rss');
            expect(res.body.details).toHaveProperty('storage');
            expect(res.body.details).toHaveProperty('application');
          }
        });
    });

    it('should handle health check timeout gracefully', async () => {
      // This test ensures the health check doesn't hang indefinitely
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/v1/health/detailed')
        .timeout(10000); // 10 second timeout
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Health check should complete within reasonable time
      expect(duration).toBeLessThan(10000);
    }, 15000);
  });

  describe('Health check resilience', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('uptime');
      });
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      const requests = Array(50).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/health')
      );

      await Promise.all(requests);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // All 50 requests should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    }, 10000);
  });

  describe('Error handling', () => {
    it('should handle invalid health endpoints gracefully', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/invalid')
        .expect(404);
    });

    it('should return proper error format for invalid endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/nonexistent')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});

