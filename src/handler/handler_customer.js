const { v4: uuidv4 } = require('uuid');

const home = async (request, h) => {
    const db = request.server.app.db;

    try {
        const kategori = await db('dim_kategori')
            .join('dim_sub_category', 'dim_kategori.kategori_id', '=', 'dim_sub_category.kategori_id')
            .select(
                'dim_kategori.kategori_id',
                'dim_kategori.kategori_name',
                'dim_sub_category.subkategori_id',
                'dim_sub_category.subkategori_name'
            );

        return h.response({
            status: 'success',
            message: 'Data kategori berhasil diamati',
            data: kategori
        }).code(200);
    } catch (error) {
        console.error('Error fetching kategori:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data kategori',
            data: null
        }).code(500);
    }
}

const search = async (request, h) => {
    const db = request.server.app.db;
    const { kategori, sub_kategori, name, page } = request.query;
    const halaman = parseInt(page) || 1;
    const offset = (halaman - 1) * 10;

    if (kategori !== undefined) {
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
                'dim_product.price',
                'dim_kategori.kategori_id',
            )
            .where('dim_kategori.kategori_id', '=', kategori)
            .limit(10)
            .offset(offset);

        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: products
        }).code(200);
    }

    if (sub_kategori !== undefined) {
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
                'dim_product.price',
                'dim_kategori.kategori_id',
            )
            .where('dim_sub_category.subkategori_id', '=', sub_kategori)
            .limit(10)
            .offset(offset);

        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: products
        }).code(200);
    }

    if (name !== undefined) {
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
                'dim_product.price',
                'dim_kategori.kategori_id',
            )
            .where('dim_product.product_name', 'like', `%${name}%`)
            .limit(10)
            .offset(offset);

        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: products
        }).code(200);
    }

    try {
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
                'dim_product.price',
                'dim_kategori.kategori_id',
            )
            .limit(10)
            .offset(offset);

        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: products
        }).code(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            data: null
        }).code(500);
    }


}

const product_detail = async (request, h) => {
    const db = request.server.app.db;
    const { id } = request.params;

    try {
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
                'dim_product.price',
                'dim_sub_category.subkategori_name',
                'dim_kategori.kategori_name'
            )
            .where('dim_product.product_id', '=', id)
            .first();

        return h.response({
            status: 'success',
            message: 'Data produk berhasil diamati',
            data: products
        }).code(200);

    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            data: null
        }).code(500);
    }
}

const addcart = async (request, h) => {
    const db = request.server.app.db;
    const { id } = request.params;
    const { quantity} = request.payload;
    const customerID = request.auth.credentials.user.customer_id;


    try {
        const cart = await db('cart')
            .insert({
                customer_id: customerID,
                product_id: id,
                quantity: quantity,
            })

        return h.response({
            status: 'success',
            message: 'Data keranjang berhasil ditambahkan',
            data: cart
        }).code(200);

    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            data: null
        }).code(500);
    }
}

const cartlist = async (request, h) => {
    const db = request.server.app.db;
    const costomerID = request.auth.credentials.user.customer_id;

    try {
        const cart = await db('cart')
            .join('dim_product', 'cart.product_id', '=', 'dim_product.product_id')
            .select(
                'cart.cart_id',
                'cart.product_id',
                'dim_product.price',
                'dim_product.product_name'
            )
            .where('cart.customer_id', '=', costomerID)

        return h.response({
            status: 'success',
            message: 'List keranjang berhasil diambil',
            data: cart
        }).code(200);

    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            data: null
        }).code(500);
    }
}

const cartdrop = async (request, h) => {
    const db = request.server.app.db;
    const { id } = request.params;
    const costomerID = request.auth.credentials.user.customer_id;
    

    try {
        const cart = await db('cart')
            .where('cart_id', '=', id)
            .where('customer_id', '=', costomerID)
            .del();

        return h.response({
            status: 'success',
            message: 'Data keranjang berhasil dihapus',
            data: cart
        }).code(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            data: null
        }).code(500);
    }
}

const order = async (request, h) => {
    const db = request.server.app.db;
    const costomerID = request.auth.credentials.user.customer_id;
    const { postal_code, state, city, region, shipmode_id } = request.payload;
    const trx = await db.transaction();
    const orderID = uuidv4();

    try {
        const cart = await db('cart')
            .join('dim_product', 'cart.product_id', '=', 'dim_product.product_id')
            .select(
                'cart.cart_id',
                'cart.product_id',
                'cart.quantity',
                'dim_product.price',
            )
            .where('cart.customer_id', '=', costomerID)

        //cek keranjang kosong
        if (cart.length === 0) {
            return h.response({
                status: 'error',
                message: 'Keranjang kosong',
                data: null
            }).code(400);
        }

        //cek postal code
        const result = await db('dim_region').select('postal_code').where('postal_code', '=', postal_code)

        if (result.length === 0) {
            await db('dim_region').insert({
                postal_code: postal_code,
                state: state,
                city: city,
                country: 'United States',
                region: region,
            });
        }

        //cek date
        const today = new Date();
        const dateId = today.toISOString().split('T')[0];
        const existingDate = await db('dim_date').where('date_id', dateId).first();

        if (!existingDate) {
            const day = today.getDate();
            const month = today.getMonth() + 1; // Ingat: getMonth() mulai dari 0 (Januari = 0)
            const year = today.getFullYear();
            const quarter = Math.ceil(month / 3);

            const monthName = today.toLocaleString('en-US', { month: 'long' });
            const dayName = today.toLocaleString('en-US', { weekday: 'long' });

            await db('dim_date').insert({
                date_id: dateId,
                day: day,
                month: month,
                year: year,
                quarter: quarter,
                month_name: monthName,
                day_name: dayName
            });
        }

        for (const item of cart) {

            const total_price = item.price * item.quantity;

            await trx('tabel_order').insert({
                order_id: orderID,
                customer_id: costomerID,
                order_date: dateId,
                product_id: item.product_id,
                quantity: item.quantity,
                sales: total_price,
                shipmode_id: shipmode_id,
                postalcode: postal_code,
            });
        }

        await trx('cart').where('customer_id', '=', costomerID).del();

        await trx.commit();

        return h.response({
            status: 'success',
            message: 'Order berhasil',
        }).code(200);

    } catch (error) {
        await trx.rollback();
        console.error('Transaction Eror:', error);
        return h.response({
            status: 'error',
            message: 'Gagal melakukan transaksi',
        }).code(500);
    }
}

const orderlst = async( request, h) =>{
    const db = request.server.app.db;
    const costomerID = request.auth.credentials.user.customer_id;

    try {
        const orders = await db('tabel_order')
            .join('dim_product', 'tabel_order.product_id', '=', 'dim_product.product_id')
            .join('dim_shipmode', 'tabel_order.shipmode_id', '=', 'dim_shipmode.shipmode_id')
            .select(
                'tabel_order.order_id',
                'tabel_order.order_date',
                'dim_product.product_name',
                'tabel_order.quantity',
                'tabel_order.sales',
                'tabel_order.status',
                'dim_shipmode.shipmode',
            )
            .where('tabel_order.customer_id', '=', costomerID)
            .orderBy('tabel_order.order_date', 'desc');
        
        return h.response({
            status: 'success',
            message: 'List order berhasil diambil',
            data: orders
        }).code(200);
    } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
        }).code(500);
    }
}

module.exports = { home, search, product_detail, addcart, cartlist, cartdrop, order, orderlst };