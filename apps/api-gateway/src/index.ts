import Fastify from 'fastify';
import proxy from '@fastify/http-proxy';
import fastifyRateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const fastify = Fastify({ logger: true });

// Setup Redis for Rate Limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

fastify.register(fastifyRateLimit, {
  max: 100, // default limit 100 requests per minute
  timeWindow: '1 minute',
  redis: redis
});

const publicKeyPath = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../keys/public.pem');
let publicKey: string = '';

try {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch (error) {
  fastify.log.warn('Public key not found in filesystem. Checking environment variable JWT_PUBLIC_KEY.');
}

fastify.decorateRequest('user', null);

fastify.addHook('preHandler', async (request, reply) => {
  // Public routes mapping (e.g. Identity Service login/register)
  if (request.url.startsWith('/auth')) {
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const key = process.env.JWT_PUBLIC_KEY || publicKey;
    if (!key) {
      throw new Error('Server misconfiguration: No public key available to verify tokens');
    }
    const decoded = jwt.verify(token, key, { algorithms: ['RS256'] });
    (request as any).user = decoded;
  } catch (err) {
    fastify.log.error(err);
    reply.status(401).send({ error: 'Unauthorized: Invalid token' });
    return;
  }
});

// Route proxying to microservices
fastify.register(proxy, {
  upstream: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
  prefix: '/auth',
  rewritePrefix: '/auth'
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`API Gateway listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
