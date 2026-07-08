package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/domain"
	"github.com/redis/go-redis/v9"
)

const (
	recordPrefix       = "record:"
	rankingPrefix      = "ranking:"
	facultyIndex       = "faculty_index:"
	rankingsSortedSet  = "rankings:sorted"
	recordsHashKey     = "records:hash"
	rankingsHashKey    = "rankings:hash"
	ttlDuration        = 24 * time.Hour
)

type RedisRepository struct {
	client *redis.Client
}

func NewRedisRepository(client *redis.Client) *RedisRepository {
	return &RedisRepository{
		client: client,
	}
}

// Health checks Redis connection
func (r *RedisRepository) Health(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

// SaveRecord stores an academic record in Redis
func (r *RedisRepository) SaveRecord(record domain.AcademicRecord) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	data, err := json.Marshal(record)
	if err != nil {
		return err
	}

	key := fmt.Sprintf("%s%s", recordPrefix, record.ID)
	
	pipe := r.client.Pipeline()
	
	// Save individual record
	pipe.Set(ctx, key, data, ttlDuration)
	// Index by faculty for quick filtering
	pipe.SAdd(ctx, fmt.Sprintf("%s%s", facultyIndex, record.Faculty), record.ID)
	// Hash for bulk retrieval
	pipe.HSet(ctx, recordsHashKey, record.ID, data)
	
	_, err = pipe.Exec(ctx)
	return err
}

// BulkSaveRecords stores multiple academic records in Redis using a single pipeline
func (r *RedisRepository) BulkSaveRecords(records []domain.AcademicRecord) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pipe := r.client.Pipeline()
	for _, record := range records {
		data, err := json.Marshal(record)
		if err != nil {
			return err
		}

		key := fmt.Sprintf("%s%s", recordPrefix, record.ID)
		
		pipe.Set(ctx, key, data, ttlDuration)
		pipe.SAdd(ctx, fmt.Sprintf("%s%s", facultyIndex, record.Faculty), record.ID)
		pipe.HSet(ctx, recordsHashKey, record.ID, data)
	}

	_, err := pipe.Exec(ctx)
	return err
}

// GetRecordsByFacultyAndCareer retrieves records filtered by faculty and career
func (r *RedisRepository) GetRecordsByFacultyAndCareer(faculty, career string) ([]domain.AcademicRecord, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get all record IDs for this faculty
	recordIDs, err := r.client.SMembers(ctx, fmt.Sprintf("%s%s", facultyIndex, faculty)).Result()
	if err != nil {
		return nil, err
	}

	var records []domain.AcademicRecord
	for _, id := range recordIDs {
		key := fmt.Sprintf("%s%s", recordPrefix, id)
		val, err := r.client.Get(ctx, key).Result()
		if err != nil {
			if err == redis.Nil {
				continue
			}
			return nil, err
		}

		var record domain.AcademicRecord
		if err := json.Unmarshal([]byte(val), &record); err != nil {
			continue
		}

		if record.Career == career {
			records = append(records, record)
		}
	}

	return records, nil
}

// GetAllRecords retrieves all records using HGETALL (more efficient than SCAN)
func (r *RedisRepository) GetAllRecords() ([]domain.AcademicRecord, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	vals, err := r.client.HGetAll(ctx, recordsHashKey).Result()
	if err != nil {
		return nil, err
	}

	var records []domain.AcademicRecord
	for _, val := range vals {
		var record domain.AcademicRecord
		if err := json.Unmarshal([]byte(val), &record); err != nil {
			continue
		}
		records = append(records, record)
	}

	return records, nil
}

// SaveRanking stores a ranking score in Redis (read projection)
func (r *RedisRepository) SaveRanking(ranking domain.RankingScore) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	data, err := json.Marshal(ranking)
	if err != nil {
		return err
	}

	key := fmt.Sprintf("%s%s", rankingPrefix, ranking.RecordID)
	
	pipe := r.client.Pipeline()
	
	// Save individual ranking
	pipe.Set(ctx, key, data, ttlDuration)
	// Add to sorted set for range queries (higher score = better rank)
	pipe.ZAdd(ctx, rankingsSortedSet, redis.Z{
		Score:  ranking.Score,
		Member: ranking.RecordID,
	})
	// Hash for bulk retrieval
	pipe.HSet(ctx, rankingsHashKey, ranking.RecordID, data)
	
	_, err = pipe.Exec(ctx)
	return err
}

// GetRanking retrieves a ranking by record ID
func (r *RedisRepository) GetRanking(recordID string) (*domain.RankingScore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	key := fmt.Sprintf("%s%s", rankingPrefix, recordID)
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, domain.ErrRecordNotFound
		}
		return nil, err
	}

	var ranking domain.RankingScore
	if err := json.Unmarshal([]byte(val), &ranking); err != nil {
		return nil, err
	}

	return &ranking, nil
}

// GetAllRankings retrieves all rankings (uses sorted set for efficient range queries)
func (r *RedisRepository) GetAllRankings() ([]domain.RankingScore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all ranking data from hash
	vals, err := r.client.HGetAll(ctx, rankingsHashKey).Result()
	if err != nil {
		return nil, err
	}

	var rankings []domain.RankingScore
	for _, val := range vals {
		var ranking domain.RankingScore
		if err := json.Unmarshal([]byte(val), &ranking); err != nil {
			continue
		}
		rankings = append(rankings, ranking)
	}

	return rankings, nil
}

// GetTopRankings retrieves top N rankings using ZRANGE (more efficient than GetAllRankings + sort)
func (r *RedisRepository) GetTopRankings(limit int) ([]domain.RankingScore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get top N from sorted set (highest scores first)
	recordIDs, err := r.client.ZRevRange(ctx, rankingsSortedSet, 0, int64(limit-1)).Result()
	if err != nil {
		return nil, err
	}

	var rankings []domain.RankingScore
	for _, id := range recordIDs {
		ranking, err := r.GetRanking(id)
		if err != nil {
			continue
		}
		rankings = append(rankings, *ranking)
	}

	return rankings, nil
}

// ClearAll clears all data from Redis (use with caution)
func (r *RedisRepository) ClearAll() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipe := r.client.Pipeline()

	// Delete all keys
	pipe.FlushDB(ctx)

	_, err := pipe.Exec(ctx)
	return err
}

// InvalidateRecord removes an academic record from Redis (Cache Invalidation)
func (r *RedisRepository) InvalidateRecord(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	key := fmt.Sprintf("%s%s", recordPrefix, id)
	
	// We need to fetch it first to know the faculty, to remove from the set, but this might be overkill.
	// Since we are invalidating, we can just remove it from the hash and delete the key.
	// To be safe, we can try to fetch it first.
	val, err := r.client.Get(ctx, key).Result()
	if err == nil && val != "" {
		var record domain.AcademicRecord
		if json.Unmarshal([]byte(val), &record) == nil {
			r.client.SRem(ctx, fmt.Sprintf("%s%s", facultyIndex, record.Faculty), id)
		}
	}

	pipe := r.client.Pipeline()
	pipe.Del(ctx, key)
	pipe.HDel(ctx, recordsHashKey, id)
	
	_, err = pipe.Exec(ctx)
	return err
}
