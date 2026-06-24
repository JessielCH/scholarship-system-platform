const { Client } = require('pg');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'postgres';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres123!';
const DB_NAME = process.env.DB_NAME || 'identitydb';
const DB_PORT = process.env.DB_PORT || 5432;

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const API_GATEWAY = process.env.API_GATEWAY || 'http://localhost:3000';

const BATCH_SIZE = 1000;
const TOTAL_RECORDS = 50000;

const uceFaculties = [
	"Ingenieria y Ciencias Aplicadas",
	"Ciencias Medicas",
	"Jurisprudencia",
	"Ciencias Administrativas",
	"Filosofia y Letras",
	"Arquitectura y Urbanismo",
	"Ciencias Agricolas",
	"Ciencias Economicas",
	"Ciencias Psicologicas",
	"Odontologia",
	"Ciencias Quimicas",
	"Comunicacion Social",
	"Artes",
	"Cultura Fisica",
	"Medicina Veterinaria",
	"Ciencias Biologicas",
	"Geologia y Minas",
	"Ciencias de la Discapacidad",
];

async function seed() {
  console.log('Starting Global Seeder...');

  const initClient = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
    port: DB_PORT
  });

  const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
  });

  let pgClient;
  try {
    await initClient.connect();
    console.log(`Checking if database "${DB_NAME}" exists...`);
    const res = await initClient.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Database "${DB_NAME}" does not exist. Creating it automatically...`);
      await initClient.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database "${DB_NAME}" created successfully.`);
    } else {
      console.log(`Database "${DB_NAME}" already exists.`);
    }

    const res2 = await initClient.query(`SELECT 1 FROM pg_database WHERE datname = 'socioeconomic_db'`);
    if (res2.rowCount === 0) {
      console.log(`Database "socioeconomic_db" does not exist. Creating it automatically...`);
      await initClient.query(`CREATE DATABASE "socioeconomic_db"`);
      console.log(`Database "socioeconomic_db" created successfully.`);
    } else {
      console.log(`Database "socioeconomic_db" already exists.`);
    }
    await initClient.end();

    pgClient = new Client({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT
    });

    await pgClient.connect();
    console.log(`Connected to PostgreSQL (${DB_NAME})`);

    try {
      const countRes = await pgClient.query('SELECT COUNT(*) FROM "user"');
      if (parseInt(countRes.rows[0].count) >= TOTAL_RECORDS) {
          console.log(`Already found ${countRes.rows[0].count} records. Skipping seed.`);
          return;
      }
    } catch (e) {
      console.log('User table might not exist yet, creating it...');
      await pgClient.query(`
        CREATE TABLE IF NOT EXISTS "user" (
          "id" varchar PRIMARY KEY,
          "email" varchar UNIQUE NOT NULL,
          "passwordHash" varchar NOT NULL,
          "role" varchar NOT NULL DEFAULT 'STUDENT'
        );
      `);
    }

    // Generate one hash to reuse for all synthetic students to save massive CPU time
    console.log('Generating shared bcrypt hash for "student123"...');
    const salt = await bcrypt.genSalt(10);
    const sharedHash = await bcrypt.hash('student123', salt);

    console.log('Clearing old synthetic students from Postgres...');
    await pgClient.query("DELETE FROM \"user\" WHERE email LIKE 'student_%@uce.edu.ec'");
    
    console.log('Clearing old cache from Redis...');
    await redisClient.flushdb();

    console.log(`Inserting ${TOTAL_RECORDS} students in batches of ${BATCH_SIZE}...`);
    
    let lastIdx = 0;

    for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
      let pgValues = [];
      let redisPipeline = redisClient.pipeline();

      for (let j = 0; j < BATCH_SIZE; j++) {
        const idx = i + j;
        lastIdx = idx;
        const id = `student_${idx}`;
        const email = `student_${idx}@uce.edu.ec`;

        // Postgres User value string
        pgValues.push(`('${id}', '${email}', '${sharedHash}', 'STUDENT')`);

        // Redis Academic Record
        const fac = uceFaculties[idx % uceFaculties.length];
        const gpa = Math.round((10.0 + Math.random() * 10.0) * 100) / 100;
        const vuln = Math.round((Math.random() * 100.0) * 100) / 100;
        const semester = Math.floor(Math.random() * 8) + 3;

        const record = {
          ID: id,
          StudentID: id,
          Faculty: fac,
          Career: fac + ' General',
          Semester: semester,
          GPA: gpa,
          VulnerabilityScore: vuln
        };

        const key = `record:${id}`;
        redisPipeline.set(key, JSON.stringify(record), 'EX', 86400); // 24 hours
        redisPipeline.hset('records:hash', key, JSON.stringify(record));
      }

      // Insert Postgres batch
      const query = `INSERT INTO "user" (id, email, "passwordHash", role) VALUES ${pgValues.join(',')}`;
      await pgClient.query(query);

      // Insert Redis batch
      await redisPipeline.exec();

      console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${lastIdx + 1} records)`);
    }

    console.log('Database seeded successfully!');

    // Get an admin token to trigger the process endpoint
    console.log('Authenticating as admin to trigger processing...');
    const loginRes = await fetch(`${API_GATEWAY}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'admin@uce.edu.ec', password: 'admin123'})
    });
    
    if (!loginRes.ok) {
      console.log('Failed to authenticate as admin. Status:', loginRes.status);
      return;
    }
    
    const { access_token } = await loginRes.json();

    console.log('Triggering Academic Engine to process the 10,000 new records...');
    const processRes = await fetch(`${API_GATEWAY}/api/v1/commands/academic/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-User-Role': 'ADMIN'
      }
    });

    const processText = await processRes.text();
    console.log('Process response:', processText);

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
    redisClient.disconnect();
  }
}

seed();
