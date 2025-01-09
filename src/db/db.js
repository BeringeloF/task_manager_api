import pg from 'pg';
import runFirst from '../runFirst.js';

const { Pool } = pg;

const wait = (sec) =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000 * sec);
  });

const pool = new Pool({
  database: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 2500,
});

(async function checkConnection() {
  try {
    // Tentando uma consulta simples para garantir que a conexão foi estabelecida
    console.log({
      database: process.env.DB,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      connectionTimeoutMillis: 2500,
    });

    const res = await pool.query('SELECT NOW()');
    console.log('DB connected succesfuly', new Date(res.rows[0].now));
  } catch (err) {
    console.error('Error while connecting on DB', err.message, err.stack);
  }
})();

export default pool;
