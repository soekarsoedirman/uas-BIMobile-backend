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
            db('fact_sales').countDistinct('order_id as total').first(),
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
    const { product_name, subkategori_id, price } = request.payload;
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
            price: price,
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
    const { id } = request.params;   
    const { product_name, price, subkategori_id  } = request.payload;
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
                price,
                subkategori_id,
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

const orderlist = async (request, h) => {
    const db = request.server.app.db;
    const userRole = request.auth.credentials.user.role_id;

    if (userRole !== 1) {
        return h.response({ status: 'error', message: 'Access Denied' }).code(403);
    }

    try {
        const orders = await db('tabel_order')
            .join('dim_customer', 'dim_customer.customer_id', '=', 'tabel_order.customer_id')
            .select(
                'tabel_order.order_id',
                'dim_customer.customer_name',
                'tabel_order.product_id',
                'tabel_order.order_date',
                'tabel_order.quantity',
                'tabel_order.sales',
                'tabel_order.status',
                'tabel_order.postalcode',
            );
        
        return h.response({ 
            status: 'success', 
            massage: 'Data order berhasil diambil',
            data: orders 
        }).code(200);
    } catch (error) {
        console.error('Error fetching order list:', error);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const orderdetail = async (request, h) => {
    const db = request.server.app.db;
    const userRole = request.auth.credentials.user.role_id;
    const { id } = request.params;
    
    if (userRole !== 1) {
        return h.response({ status: 'error', message: 'Access Denied' }).code(403);
    }

    try {
        const orders = await db('tabel_order')
            .join('dim_customer', 'dim_customer.customer_id', '=', 'tabel_order.customer_id')
            .join('dim_product', 'dim_product.product_id', '=', 'tabel_order.product_id')
            .select(
                'tabel_order.order_id',
                'dim_customer.customer_name',
                'tabel_order.product_id',
                'dim_product.product_name',
                'tabel_order.order_date',
                'tabel_order.quantity',
                'tabel_order.sales',
                'tabel_order.postalcode',
            ).where('tabel_order.order_id', '=', id);
        
        return h.response({ 
            status: 'success', 
            massage: 'Data order berhasil diambil',
            data: orders 
        }).code(200);
    } catch (error) {
        console.error('Error fetching order list:', error);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const orderconfirm = async (request, h) => {
    const db = request.server.app.db;
    const userRole = request.auth.credentials.user.role_id;
    const { id } = request.params;

    if (userRole !== 1) {
        return h.response({ status: 'error', message: 'Access Denied' }).code(403);
    }

    const trx = await db.transaction();

    try {
        const orderItems = await trx('tabel_order')
            .select(
                'order_id',
                'customer_id',
                'order_date',
                'product_id',
                'quantity',
                'sales',
                'status',
                'shipmode_id',
                'postalcode' // PERBAIKAN: Gunakan 'postalcode' (sesuai database)
            ).where('order_id', '=', id);

        if (orderItems.length === 0) {
            await trx.rollback();
            return h.response({
                status: 'error',
                message: 'Data order tidak ditemukan',
            }).code(404);
        }

        if (orderItems[0].status !== 'Menunggu Konfirmasi') {
            await trx.rollback(); 
            return h.response({
                status: 'error',
                message: `Order tidak bisa dikonfirmasi. Status saat ini: ${orderItems[0].status}`,
            }).code(400);
        }

        await trx('tabel_order')
            .where('order_id', '=', id)
            .update({
                status: 'Dikirim', // Sesuaikan status akhir yang diinginkan ('Success' atau 'Dikirim')
                updated_at: new Date()
            });

        const today = new Date();
        const dateId = today.toISOString().split('T')[0];
        
        const existingDate = await trx('dim_date').where('date_id', dateId).first();

        if (!existingDate) {
            const day = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            const quarter = Math.ceil(month / 3);
            const monthName = today.toLocaleString('en-US', { month: 'long' });
            const dayName = today.toLocaleString('en-US', { weekday: 'long' });

            await trx('dim_date').insert({
                date_id: dateId,
                day, month, year, quarter, month_name: monthName, day_name: dayName
            });
        }

        for (const item of orderItems) {
            await trx('fact_sales').insert({
                order_id: item.order_id,
                order_date_id: item.order_date, // Pastikan format tanggal sesuai
                ship_date_id: dateId, 
                product_id: item.product_id,
                customer_id: item.customer_id,
                postalcode: item.postalcode, // PERBAIKAN: ambil dari item.postalcode
                shipmode_id: item.shipmode_id,
                quantity: item.quantity,
                sales: item.sales,
            });
        }

        await trx.commit();

        return h.response({
            status: 'success',
            message: 'Data berhasil dikonfirmasi dan dikirim',
            data: orderItems
        }).code(200);

    } catch (error) {
        await trx.rollback();
        
        console.error('Error confirming order:', error);
        return h.response({ 
            status: 'error', 
            message: 'Internal Server Error',
            debug: error.message 
        }).code(500);
    }
};

const statistik = async (request, h) => {
    const db = request.server.app.db;
    const userRole = request.auth.credentials.user.role_id;
    const { start_date, end_date } = request.query;

    if (userRole !== 1) {
        return h.response({ status: 'error', message: 'Access Denied' }).code(403);
    }

    const filter = (query) => {
        if (start_date && end_date) {
            query.whereBetween('fact_sales.order_date_id', [start_date, end_date]);
        }
        return query;
    };

    try {
        const [
            totalSalesResult,
            totalTxResult,
            totalQtyResult,
            totalCustomerResult,
            totalProductResult,

            categoryResult,
            topProductResult,
            trendMonthlyResult,
            trendQuarterResult,
            trendYearResult,

            segmentResult,
            cityResult,


            shipModeResult
        ] = await Promise.all([

            // Simpulan            
            filter(db('fact_sales').sum('sales as total')).first(),
            filter(db('fact_sales').countDistinct('order_id as total')).first(),
            filter(db('fact_sales').sum('quantity as total')).first(),
            filter(db('fact_sales').countDistinct('customer_id as total')).first(),
            filter(db('fact_sales').countDistinct('product_id as total')).first(),

            // Kategori
            filter(db('fact_sales')
                .join('dim_product', 'fact_sales.product_id', 'dim_product.product_id')
                .join('dim_sub_category', 'dim_product.subkategori_id', 'dim_sub_category.subkategori_id')
                .join('dim_kategori', 'dim_sub_category.kategori_id', 'dim_kategori.kategori_id')
                .select('dim_kategori.kategori_name')
                .sum('fact_sales.sales as total')
                .groupBy('dim_kategori.kategori_name')),


            // Top 5 produk
            filter(db('fact_sales')
                .join('dim_product', 'fact_sales.product_id', 'dim_product.product_id')
                .select('dim_product.product_name')
                .sum('fact_sales.quantity as total')
                .groupBy('dim_product.product_name')
                .orderBy('total', 'desc')
                .limit(5)),


            // Time series
            filter(db('fact_sales')
                .join('dim_date', 'fact_sales.order_date_id', 'dim_date.date_id')
                .select('dim_date.month_name', 'dim_date.year', 'dim_date.month')
                .sum('fact_sales.sales as total')
                .groupBy('dim_date.year', 'dim_date.month', 'dim_date.month_name')
                .orderBy('dim_date.year')
                .orderBy('dim_date.month')),

            filter(db('fact_sales')
                .join('dim_date', 'fact_sales.order_date_id', 'dim_date.date_id')
                .select('dim_date.year', 'dim_date.quarter')
                .sum('fact_sales.sales as total')
                .groupBy('dim_date.year', 'dim_date.quarter')
                .orderBy('dim_date.year')
                .orderBy('dim_date.quarter')),

            filter(db('fact_sales')
                .join('dim_date', 'fact_sales.order_date_id', 'dim_date.date_id')
                .select('dim_date.year')
                .sum('fact_sales.sales as total')
                .groupBy('dim_date.year')
                .orderBy('dim_date.year')),


            // Segmen customer
            filter(db('fact_sales')
                .join('dim_customer', 'fact_sales.customer_id', 'dim_customer.customer_id')
                .select('dim_customer.segmen')
                .sum('fact_sales.sales as total')
                .groupBy('dim_customer.segmen')),

            // region
            filter(db('fact_sales')
                .join('dim_region', 'fact_sales.postalcode', 'dim_region.postal_code')
                .select('dim_region.city')
                .sum('fact_sales.sales as total')
                .groupBy('dim_region.city')
                .orderBy('total', 'desc')
                .limit(5)),


            // Shipmode
            filter(db('fact_sales')
                .join('dim_shipmode', 'fact_sales.shipmode_id', 'dim_shipmode.shipmode_id')
                .select('dim_shipmode.shipmode')
                .countDistinct('fact_sales.order_id as total_order')
                .countDistinct('fact_sales.order_id as total_sales')
                .groupBy('dim_shipmode.shipmode'))
        ]);

        const total_sales = parseFloat(totalSalesResult.total || 0);
        const total_trx = parseInt(totalTxResult.total || 0);
        const aov = total_trx > 0 ? total_sales / total_trx : 0;

        return h.response({
            status: 'success',
            message: 'Dashboard BI data fetched',
            data: {
                summary: {
                    total_sales,
                    total_transactions: total_trx,
                    avg_order_value: aov,
                    total_quantity: parseInt(totalQtyResult.total || 0),
                    total_customers: parseInt(totalCustomerResult.total || 0),
                    total_products: parseInt(totalProductResult.total || 0)
                },
                charts: {
                    sales_by_category: categoryResult,
                    top_products: topProductResult,
                    monthly_trend: trendMonthlyResult,
                    quarterly_trend: trendQuarterResult,
                    yearly_trend: trendYearResult,
                    sales_by_segment: segmentResult,
                    top_cities: cityResult,
                    shipping_performance: shipModeResult
                }
            }
        }).code(200);

    } catch (error) {
        console.error('Dashboard Error:', error);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};


module.exports = {
    dashboard,
    addproduct,
    editproduct,
    deleteproduct,
    statistik,
    orderdetail,
    orderlist,
    orderconfirm
};