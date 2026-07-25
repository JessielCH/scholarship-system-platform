import request from 'supertest';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { fastify } from './index';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const obj: any = {
      on: jest.fn(),
      call: jest.fn(),
      eval: jest.fn(),
      quit: jest.fn(),
      disconnect: jest.fn(),
      rateLimit: jest.fn((...args: any[]) => {
        const cb = args[args.length - 1];
        if (typeof cb === 'function') cb(null, [1, 50000]);
        return Promise.resolve([1, 50000]);
      }),
      defineCommand: jest.fn((name: string) => {
        obj[name] = jest.fn((...args: any[]) => {
          const cb = args[args.length - 1];
          if (typeof cb === 'function') cb(null, [1, 50000]);
          return Promise.resolve([1, 50000]);
        });
      }),
    };
    return obj;
  });
});

describe('API Gateway Proxy', () => {
  let validToken = '';

  beforeAll(async () => {
    await fastify.ready();
    try {
      const privateKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'private.pem'), 'utf8');
      validToken = jwt.sign({ sub: 'user-123', role: 'admin' }, privateKey, { algorithm: 'RS256' });
    } catch (e) {
      validToken = 'invalid.jwt.token';
    }
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return health status ok', async () => {
    const res = await request(fastify.server).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should return 401 for protected routes without token', async () => {
    const res = await request(fastify.server).get('/academic/rankings');
    expect(res.status).toBe(401);
  });

  it('should allow public access to /auth/login without token', async () => {
    const response = await request(fastify.server).post('/auth/login').send({ email: 'test', password: 'password' });
    expect(response.status).not.toBe(401);
  });

  it('should allow public access to /auth/register without token', async () => {
    const response = await request(fastify.server).post('/auth/register').send({});
    expect(response.status).not.toBe(401);
  });
});
