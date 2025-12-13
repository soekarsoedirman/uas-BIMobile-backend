// knexfile.js
module.exports = {
  development: {
    client: 'mysql2', // Ganti ke 'pg' jika pakai PostgreSQL
    connection: {
      host: '127.0.0.1',
      user: 'root',      // Username DB Anda
      password: '',      // Password DB Anda
      database: 'mobileuas', // Buat database ini dulu di phpMyAdmin/SQL
      port: 3306,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};