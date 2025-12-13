const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt'); // Import Plugin JWT
const routes = require('./src/routes');
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'mobileuas',
        port: 3306
    },
    pool: { min: 2, max: 10 }
});

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: { origin: ['*'] }
        }
    });

    server.app.db = knex;

    // --- 1. REGISTER PLUGIN JWT ---
    await server.register(Jwt);

    // --- 2. DEFINISI STRATEGI AUTH ---
    server.auth.strategy('my_jwt_strategy', 'jwt', {
        keys: process.env.JWT_SECRET || 'RAHASIA_DAPUR_JANGAN_DISEBAR', // Kunci Rahasia
        verify: {
            aud: false,
            iss: false,
            sub: false,
            nbf: true,
            exp: true, // Cek expired token otomatis
            maxAgeSec: 14400 // 4 Jam
        },
        validate: (artifacts, request, h) => {// eslint-disable-line no-unused-vars
            return {
                isValid: true,
                credentials: { 
                    user: artifacts.decoded.payload 
                }
            };
        }
    });

    // --- 3. KUNCI SEMUA ROUTE SECARA DEFAULT ---
    server.auth.default('my_jwt_strategy');

    // Cek Database
    try {
        await knex.raw('SELECT 1');
        console.log('✅ Terkoneksi ke  Database');
    } catch (err) {
        console.error('❌ Gagal koneksi ke :', err);
        process.exit(1);
    }

    server.route(routes);

    await server.start();
    console.log('🚀 Server berjalan pada %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();