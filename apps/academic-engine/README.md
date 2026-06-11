# Academic Engine - CQRS with Redis Projections

## Overview
The Academic Engine is a Go microservice that implements CQRS (Command Query Responsibility Segregation) pattern with Redis-based read projections. It processes student scholarship applications and generates rankings.

### Architecture
- **Command Model**: Writes student academic records using `CommandRepository`
- **Query Model**: Reads rankings and aggregates using Redis sorted sets (for efficient range queries)
- **Storage**: 
  - **SS-21**: In-memory storage (testing/development)
  - **SS-22**: Upstash Redis for distributed read projections (production)

## Features

- ✅ CQRS pattern implementation (SS-21)
- ✅ Upstash Redis integration for read projections (SS-22)
- ✅ Efficient ranking queries using Redis sorted sets
- ✅ Support for bulk operations (10K+ records processing)
- ✅ Health checks and monitoring
- ✅ Docker and docker-compose support
- ✅ Configurable via environment variables

## Getting Started

### Prerequisites
- Go 1.22+
- Redis 6+ (or Upstash account for cloud Redis)
- Docker & Docker Compose (optional)

### Local Development

#### Using In-Memory Repository (SS-21)
```bash
go mod download
go run ./cmd/server
```

#### Using Redis Repository (SS-22)

**Option 1: Local Redis**
```bash
# Start Redis (using Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Run Academic Engine with Redis
USE_REDIS=true REDIS_HOST=localhost go run ./cmd/server
```

**Option 2: Docker Compose**
```bash
docker-compose up
```

**Option 3: Upstash Cloud Redis**
```bash
export REDIS_URL="redis://:your-password@your-upstash-host.upstash.io:port"
export USE_REDIS=true
go run ./cmd/server
```

## API Endpoints

### Command Endpoints (Write Operations)
```
POST /api/v1/commands/academic/seed?count=10000
  - Seeds database with N random academic records

POST /api/v1/commands/academic/process
  - Processes all records and calculates rankings

PUT /api/v1/commands/academic/update-status?app_id=<ID>&status=<STATUS>
  - Updates application status
```

### Query Endpoints (Read Operations)
```
GET /api/v1/queries/academic/ranking?id=<RECORD_ID>
  - Retrieves ranking for a specific record

GET /api/v1/queries/academic/top-students?limit=100
  - Retrieves top N students by score (uses Redis sorted set)

GET /api/v1/queries/academic/statistics
  - Returns aggregate statistics (total records, average scores, etc.)

GET /health
  - Health check endpoint
```

### RBAC Headers
Add `X-User-Role` header:
- `ADMIN`: Access to command endpoints
- `STUDENT`: Access to query endpoints

**Example:**
```bash
curl -X POST http://localhost:8081/api/v1/commands/academic/seed?count=100 \
  -H "X-User-Role: ADMIN"

curl http://localhost:8081/api/v1/queries/academic/top-students?limit=10 \
  -H "X-User-Role: STUDENT"
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_REDIS` | `false` | Enable Redis as projection store |
| `REDIS_URL` | `` | Upstash Redis URL (overrides manual config) |
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | `` | Redis password |
| `REDIS_DB` | `0` | Redis database number |
| `PORT` | `8081` | HTTP server port |

### .env File
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your values
```

## Performance Benchmarks

### SS-22 Improvements (with Redis Projections)
- **Seed 10,000 records**: < 500ms
- **Process + Calculate Rankings**: < 50ms (Goroutines)
- **Query Top 100 rankings**: < 5ms (Redis sorted set)

### Why Redis Sorted Sets?
- O(log N) insert
- O(log N + M) range queries (top N)
- Automatic score-based ordering
- Efficient pagination support

## Testing

```bash
# Run tests
go test ./...

# With coverage
go test -cover ./...

# Load testing (using k6)
k6 run tests/load.js
```

## Deployment

### Docker Build
```bash
docker build -t academic-engine:latest .
```

### Docker Run
```bash
docker run -p 8081:8081 \
  -e USE_REDIS=true \
  -e REDIS_URL="redis://:password@upstash-host:port" \
  academic-engine:latest
```

### Kubernetes (future)
- Deployment manifest with Redis sidecar
- ConfigMap for environment variables
- Service and Ingress configuration

## Monitoring

### Health Checks
```bash
curl http://localhost:8081/health
```

### Metrics (future)
- Prometheus metrics on `/metrics`
- Request latency tracking
- Redis connection pool monitoring

## Related Issues
- **SS-20**: Academic Engine Go implementation
- **SS-21**: CQRS read/write separation
- **SS-22**: Upstash Redis projections (this)
- **SS-23**: Goroutines benchmark (25K rankings < 50ms)

## References
- [Redis Go Client](https://github.com/redis/go-redis)
- [Upstash Redis](https://upstash.com/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
