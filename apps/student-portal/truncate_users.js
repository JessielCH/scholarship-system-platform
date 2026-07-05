const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres123!@localhost:5432/identitydb' });
client.connect().then(() => client.query('TRUNCATE TABLE "user" CASCADE')).then(() => console.log('Truncated')).finally(() => client.end());
