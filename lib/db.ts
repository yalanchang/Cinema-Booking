import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'movie_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(connection => {
    console.log('✅');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database failed:', err.message);
  });

export default pool;