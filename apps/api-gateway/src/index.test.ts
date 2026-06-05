import request from 'supertest';
// @ts-ignore
import Fastify from 'fastify';
import proxy from '@fastify/http-proxy';

describe('API Gateway Proxy', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    
    app.addHook('preHandler', async (request: any, reply: any) => {
      if (request.url.startsWith('/auth')) {
        return;
      }
      reply.status(401).send({ error: 'Unauthorized' });
    });

    app.register(proxy, {
      upstream: 'http://localhost:9999',
      prefix: '/auth',
      rewritePrefix: '/auth'
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 for protected routes without token', async () => {
    const res = await request(app.server).get('/academic/rankings');
    expect(res.status).toBe(401);
  });

  it('should allow public access to /auth/login without token', async () => {
    // For this test, we expect a proxy error or 404 because the backend isn't mocked in this supertest,
    // but the API Gateway MUST NOT return 401. It should let it pass.
    const response = await request(app.server).post('/auth/login').send({ email: 'test', password: 'password' });
    expect(response.status).not.toBe(401);
  });

  it('should allow public access to /auth/register without token', async () => {
    const response = await request(app.server).post('/auth/register').send({});
    expect(response.status).not.toBe(401);
  });
});
