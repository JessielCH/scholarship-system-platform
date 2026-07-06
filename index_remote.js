"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const http_proxy_1 = __importDefault(require("@fastify/http-proxy"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const ioredis_1 = __importDefault(require("ioredis"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fastify = (0, fastify_1.default)({ logger: true });
// Setup Swagger
fastify.register(swagger_1.default, {
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
fastify.register(swagger_ui_1.default, {
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
    }
    catch (e) {
        fastify.log.warn('Public key not found, using fallback or it will fail in prod');
    }
}
// Setup Redis for Rate Limiting
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
fastify.register(rate_limit_1.default, {
    max: 50000, // Increased for massive load testing (25k VUs)
    timeWindow: '1 minute',
    redis: redis
});
// Setup strict CORS
fastify.register(cors_1.default, {
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
        const decoded = jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ['RS256'] });
        request.user = decoded;
        request.headers['x-user-role'] = decoded.role || '';
        request.headers['x-user-id'] = decoded.sub || '';
    }
    catch (err) {
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
    { prefix: '/api/documents', envVar: 'DOCUMENT_SERVICE_URL', default: 'http://localhost:8084', rewritePrefix: '/api/documents' },
    { prefix: '/documents', envVar: 'DOCUMENT_SERVICE_URL', default: 'http://localhost:8084', rewritePrefix: '/documents' },
    { prefix: '/audit', envVar: 'AUDIT_SERVICE_URL', default: 'http://localhost:3005', rewritePrefix: '/audit' },
    { prefix: '/saga', envVar: 'SAGA_SERVICE_URL', default: 'http://localhost:3006', rewritePrefix: '/saga' },
    { prefix: '/financial', envVar: 'FINANCIAL_SERVICE_URL', default: 'http://localhost:3007', rewritePrefix: '' },
];
for (const s of services) {
    fastify.register(http_proxy_1.default, {
        upstream: process.env[s.envVar] || s.default,
        prefix: s.prefix,
        rewritePrefix: typeof s.rewritePrefix === 'string' ? s.rewritePrefix : s.prefix
    });
}
const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        fastify.log.info(`API Gateway listening on port ${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
// trigger ci
