import Fastify from 'fastify';
import proxy from '@fastify/http-proxy';
import fastifyRateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

const fastify = Fastify({ logger: true });

// Setup Swagger
fastify.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'UCE Scholarship System API Gateway',
      description: 'API Gateway for all 10 Microservices',
      version: '1.0.0'
    },
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  }
});

fastify.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});


// Load RSA public key
let publicKey = process.env.JWT_PUBLIC_KEY ? process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n') : '';
if (!publicKey) {
  try {
    publicKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8');
  } catch (e) {
    fastify.log.warn('Public key not found, using fallback or it will fail in prod');
  }
}

// Setup Redis for Rate Limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

fastify.register(fastifyRateLimit, {
  max: 50000, // Increased for massive load testing (25k VUs)
  timeWindow: '1 minute',
  redis: redis
});

// Setup strict CORS
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? 'https://uce.edu.ec' : true,
  credentials: true,
});

fastify.decorateRequest('user', null);

fastify.get('/health', async () => {
  return { status: 'ok' };
});

fastify.addHook('preHandler', async (request, reply) => {
  // Public routes mapping (e.g. Identity Service login/register)
  if (request.url.startsWith('/auth') || request.url.startsWith('/api/auth')) {
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    (request as any).user = decoded;
  } catch (err) {
    fastify.log.error(err);
    reply.status(401).send({ error: 'Unauthorized: Invalid token' });
    return;
  }
});

// Proxy routes mapped to services
const services = [
  { prefix: '/api/auth', envVar: 'IDENTITY_SERVICE_URL', default: 'http://localhost:3001', rewritePrefix: '/auth' },
  { prefix: '/api/v1/queries/academic', envVar: 'ACADEMIC_SERVICE_URL', default: 'http://localhost:3002', rewritePrefix: '/api/v1/queries/academic' },
  { prefix: '/api/v1/commands/academic', envVar: 'ACADEMIC_SERVICE_URL', default: 'http://localhost:3002', rewritePrefix: '/api/v1/commands/academic' },
  { prefix: '/auth', envVar: 'IDENTITY_SERVICE_URL', default: 'http://localhost:3001', rewritePrefix: '/auth' },
  { prefix: '/academic', envVar: 'ACADEMIC_SERVICE_URL', default: 'http://localhost:3002', rewritePrefix: '/academic' },
  { prefix: '/socioeconomic', envVar: 'SOCIOECONOMIC_SERVICE_URL', default: 'http://localhost:3003', rewritePrefix: '/socioeconomic' },
  { prefix: '/documents', envVar: 'DOCUMENT_SERVICE_URL', default: 'http://localhost:3004', rewritePrefix: '/documents' },
  { prefix: '/audit', envVar: 'AUDIT_SERVICE_URL', default: 'http://localhost:3005', rewritePrefix: '/audit' },
  { prefix: '/saga', envVar: 'SAGA_SERVICE_URL', default: 'http://localhost:3006', rewritePrefix: '/saga' },
  { prefix: '/financial', envVar: 'FINANCIAL_SERVICE_URL', default: 'http://localhost:3007', rewritePrefix: '/financial' },
];

for (const s of services) {
  fastify.register(proxy, {
    upstream: process.env[s.envVar] || s.default,
    prefix: s.prefix,
    rewritePrefix: s.rewritePrefix || s.prefix
  });
}

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
// trigger ci