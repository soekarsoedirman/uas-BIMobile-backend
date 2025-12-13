const { v4: uuidv4 } = require('uuid');

const dashboard = async (request, h) => {
    const db = request.server.app.db;
    const userRole = request.auth.credentials.user.role_id;

    if (userRole !== 1) {
        return h.response({
            status: 'error',
            message: 'Anda tidak memiliki izin untuk mengakses dashboard'
        }).code(403);
    }

    try {
        const [totalProducts, totalTransactions, totalRevenue] = await Promise.all([
            db('dim_product').count('product_id as total').first(),
            db('fact_sales').count('row_id as total').first(),
            db('fact_sales').sum('sales as total').first()
        ]);


        const data = {
            total_products: parseInt(totalProducts.total || 0),
            total_transactions: parseInt(totalTransactions.total || 0),
            total_revenue: parseFloat(totalRevenue.total || 0) 
        };

        return h.response({
            status: 'success',
            message: 'Data dashboard berhasil diambil',
            data: {
                metrics: data,
            }
        }).code(200);

    } catch (error) {
        console.error('Dashboard Error:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data dashboard'
        }).code(500);
    }
};

const addproduct = async (request, h) => {
    const db = request.server.app.db;
    const { product_name, subkategori_id } = request.payload;
    const userRole = request.auth.credentials.user.role_id;

    if (userRole !== 1) {
        return h.response({
            status: 'error',
            message: 'Anda tidak memiliki izin untuk mengakses endpoint'
        }).code(403);
    }

    try {
        const id_unik = uuidv4();
        await db('dim_product').insert({
            product_id: id_unik,
            product_name: product_name,
            subkategori_id: subkategori_id
        })

        return h.response({
            status: 'success',
            message: 'Data produk berhasil ditambahkan',
            data: {
                product_id: id_unik,
                product_name: product_name,
                subkategori_id: subkategori_id
            }
        }).code(200);
        
    } catch (error) {
        console.error('Error fetching product:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};

const editproduct = async (request, h) => {
    const db = request.server.app.db;
    const { id } = request.params;   // ✅ WAJIB ADA
    const { product_name, subkategori_id } = request.payload;
    const userRole = request.auth.credentials.user.role_id;

    if (userRole !== 1) {
        return h.response({
            status: 'error',
            message: 'Anda tidak memiliki izin untuk mengakses endpoint'
        }).code(403);
    }

    if (!id) {
        return h.response({
            status: 'fail',
            message: 'product_id tidak ditemukan'
        }).code(400);
    }

    try {
        const updated = await db('dim_product')
            .where('product_id', id)
            .update({
                product_name,
                subkategori_id
            });

        if (updated === 0) {
            return h.response({
                status: 'fail',
                message: 'Produk tidak ditemukan'
            }).code(404);
        }

        return h.response({
            status: 'success',
            message: 'Produk berhasil diupdate'
        }).code(200);

    } catch (error) {
        console.error('Error fetching product:', error);
        return h.response({
            status: 'error',
            message: 'Internal Server Error'
        }).code(500);
    }
};

const deleteproduct = async (request, h) => {
    const db = request.server.app.db;
    const { id } = request.params;
    const userRole = request.auth.credentials.user.role_id;

    if (userRole !== 1) {
        return h.response({
            status: 'error',
            message: 'Anda tidak memiliki izin untuk mengakses endpoint'
        }).code(403);
    }

    try {
        await db('dim_product')
            .where('product_id', '=', id)
            .del()

        return h.response({
            status: 'success',
            message: 'Data produk berhasil dihapus',
            data: {
                product_id: id
            }
        }).code(200);

    } catch (error) {
        console.error('Error fetching product:', error);
        return h.response({status: 'error', message: 'Internal Server Error'}).code(500);
    }
};

const statistik = async (request, h) => {
    const db = request.server.app.db;
    const userRole = request.auth.credentials.user.role_id;

    if (userRole !== 1) {
        return h.response({
            status: 'error',
            message: 'Anda tidak memiliki izin untuk mengakses endpoint'
        }).code(403);
    }

    console.log( userRole);
    return h.response({
        status: 'success',
        message: 'Berhasil masuk dashboard',
        data: {
            role: userRole
        }
    }).code(200);
};

module.exports = {
    dashboard,
    addproduct,
    editproduct,
    deleteproduct,
    statistik
};