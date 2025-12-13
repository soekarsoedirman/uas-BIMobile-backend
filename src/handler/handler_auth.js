const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const { v4: uuidv4 } = require('uuid');



const JWT_SECRET = process.env.JWT_SECRET || 'RAHASIA_DAPUR_JANGAN_DISEBAR'; 

// --- 1. HANDLER REGISTER ---
const authregister = async (request, h) => {
    // 1. Ambil DB dari Server (Sama seperti addProduct)
    const db = request.server.app.db;

    const { username, roleID, email, password, segmen } = request.payload;

    try {
        //cek emai
        const existingUser = await db('akun').where('email', email).first();
        
        if (existingUser) {
            return h.response({
                status: 'fail',
                message: 'Email sudah terdaftar'
            }).code(400);
        }

        //hash pw
        const hashedPassword = await bcrypt.hash(password, 10);
        //generate id
        const id_unik =  uuidv4();
        
        //add customer baru
        await db('dim_customer').insert({
            customer_id: id_unik,
            customer_name: username,
            segmen: segmen
        })

        //add akun baru
        const [newUserID] = await db('akun').insert({
            email: email,
            password: hashedPassword,
            id_role: roleID,
            customer_id: id_unik, 
        });

        // 4. Generate Token
        const token = Jwt.token.generate(
            { id: newUserID, role: roleID, name: username },
            { key: JWT_SECRET, algorithm: 'HS256' },
            { ttlSec: 14400 }
        );

        return h.response({
            username: username,
            roleID: roleID,
            tokenjwt: token
        }).code(201);

    } catch (error) {
        console.error('Register Error:', error);
        return h.response({ status: 'error', message: 'Terjadi kesalahan server' }).code(500);
    }
};

// --- 2. HANDLER LOGIN ---
const authlogin = async (request, h) => {
    const db = request.server.app.db;
    const { email, password } = request.payload;

    try {
        const user = await db('akun')
            .join('user_role', 'akun.id_role', '=', 'user_role.role_id')
            .leftJoin('dim_customer', 'akun.customer_id', '=', 'dim_customer.customer_id') // Left join jaga-jaga kalau admin ga punya customer_id
            .select(
                'akun.email', 
                'akun.password', 
                'akun.id_role', 
                'akun.customer_id',
                'user_role.role_name',
                'dim_customer.customer_name'
            )
            .where('akun.email', email)
            .first();

        if (!user) {
            return h.response({ status: 'fail', message: 'Email atau Password salah' }).code(401);
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return h.response({ status: 'fail', message: 'Email atau Password salah' }).code(401);
        }

        const displayName = user.customer_name || user.email.split('@')[0];

        // generate token
        const token = Jwt.token.generate(
            { 
                id: user.customer_id || user.email, 
                role: user.role_name,               
                role_id: user.id_role,
                name: displayName 
            },
            { key: JWT_SECRET, algorithm: 'HS256' },
            { ttlSec: 14400 } 
        );

        return h.response({
            status: 'success',
            message: 'Login berhasil',
            data: {
                username: displayName,
                role: user.role_name,
                token: token
            }
        }).code(200);

    } catch (error) {
        console.error('Login Error:', error);
        return h.response({ status: 'error', message: 'Terjadi kesalahan server' }).code(500);
    }
};

const authlogout = async (request, h) => {
    return h.response({
        status: 'success',
        message: 'Logout berhasil'
    }).code(200);
};

module.exports = { authregister, authlogin, authlogout };