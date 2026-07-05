const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres123!@localhost:5432/identitydb' });
client.connect().then(() => client.query('SELECT id, email FROM "user"')).then(res => console.log(res.rows)).finally(() => client.end());
