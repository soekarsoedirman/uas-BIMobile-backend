

const home = async (request, h) =>{
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

const search = async (request, h) =>{
    const db = request.server.app.db;
    const { kategori, sub_kategori, name, page } = request.query;
    const halaman = parseInt(page) || 1;
    const offset = (halaman - 1) * 10;

    if (kategori !== undefined){
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
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

    if(sub_kategori !== undefined){
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
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

    if(name !== undefined){
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
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

const product_detail = async (request, h) =>{
    const db = request.server.app.db;
    const { id } = request.params;

    try {
        const products = await db('dim_product')
            .join('dim_sub_category', 'dim_product.subkategori_id', '=', 'dim_sub_category.subkategori_id')
            .join('dim_kategori', 'dim_sub_category.kategori_id', '=', 'dim_kategori.kategori_id')
            .select(
                'dim_product.product_id',
                'dim_product.product_name',
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

const addcart = async (request, h) =>{
    const db = request.server.app.db;
    const { id } = request.params;
    const costomerID = request.auth.credentials.user.id;
    

    try {
        const cart = await db('cart')
            .insert({
                customer_id: costomerID,
                product_id: id,
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

const cartlist = async (request, h) =>{
    const db = request.server.app.db;
    const costomerID = request.auth.credentials.user.id;

    try {
        const cart = await db('cart')
            .join('dim_product', 'cart.product_id', '=', 'dim_product.product_id')
            .select(
                'cart.cart_id',
                'cart.product_id',
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

const cartdrop = async (request, h) =>{
    const db = request.server.app.db;
    const { id } = request.params;
    const costomerID = request.auth.credentials.user.id;

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

module.exports = { home, search, product_detail, addcart, cartlist, cartdrop };