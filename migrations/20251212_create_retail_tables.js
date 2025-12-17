exports.up = function(knex) {
  return knex.schema
    // =========================================
    // 1. DATA MASTER (INDEPENDENT)
    // =========================================
    
    // 1.1 USER ROLE
    .createTable('user_role', function(table) {
      table.integer('role_id').primary(); 
      table.string('role_name').notNullable();
    })

    // 1.2 DIM KATEGORI
    .createTable('dim_kategori', function(table) {
      table.integer('kategori_id').primary(); 
      table.string('kategori_name').notNullable();
    })

    // 1.3 DIM REGION
    .createTable('dim_region', function(table) {
      table.string('postal_code').primary(); 
      table.string('city');
      table.string('state');
      table.string('region');
      table.string('country');
    })

    // 1.4 DIM SHIPMODE
    .createTable('dim_shipmode', function(table) {
      table.integer('shipmode_id').primary();
      table.string('shipmode');
    })

    // 1.5 DIM DATE
    .createTable('dim_date', function(table) {
      table.date('date_id').primary(); 
      table.integer('day');
      table.integer('month');
      table.integer('year');
      table.integer('quarter');
      table.string('month_name');
      table.string('day_name');
    })

    // 1.6 DIM CUSTOMER
    .createTable('dim_customer', function(table) {
      table.string('customer_id').primary();
      table.string('customer_name');
      table.string('segmen');
    })

    // =========================================
    // 2. DATA DIMENSI BERJENJANG (DEPENDENT)
    // =========================================

    // 2.1 DIM SUB CATEGORY (Butuh Kategori)
    .createTable('dim_sub_category', function(table) {
      table.integer('subkategori_id').primary();
      table.string('subkategori_name').notNullable();
      
      table.integer('kategori_id').references('kategori_id').inTable('dim_kategori')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })

    // 2.2 DIM PRODUCT (Butuh Sub Kategori)
    .createTable('dim_product', function(table) {
      table.string('product_id').primary(); 
      table.string('product_name', 500); 
      table.decimal('price', 15, 2); 
      
      table.integer('subkategori_id').references('subkategori_id').inTable('dim_sub_category')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })

    // =========================================
    // 3. TABEL APLIKASI / OPERASIONAL
    // =========================================

    // 3.1 AKUN 
    .createTable('akun', function(table) {
      table.string('email').primary();
      table.string('password').notNullable();
      
      table.integer('id_role').references('role_id').inTable('user_role')
        .onDelete('CASCADE').onUpdate('CASCADE');

      table.string('customer_id').nullable();
      table.foreign('customer_id').references('customer_id').inTable('dim_customer')
        .onDelete('SET NULL').onUpdate('CASCADE');
      
      table.timestamps(true, true); 
    })

    // 3.2 CART 
    .createTable('cart', function(table) {
      table.increments('cart_id').primary();
      
      table.string('customer_id').references('customer_id').inTable('dim_customer')
        .onDelete('CASCADE').onUpdate('CASCADE');

      table.string('product_id').references('product_id').inTable('dim_product')
        .onDelete('CASCADE').onUpdate('CASCADE');

      table.integer('quantity').defaultTo(1);
      table.timestamps(true, true);
    })

    // 3.3 TABEL ORDER 
    .createTable('tabel_order', function(table) {
      table.string('order_id').primary();

      table.string('customer_id').references('customer_id').inTable('dim_customer')
        .onDelete('CASCADE').onUpdate('CASCADE');

      table.date('order_date');
      table.string('product_id').references('product_id').inTable('dim_product');
      table.integer('quantity');
      table.decimal('sales', 15, 2);
      table.string('status').defaultTo('Menunggu Konfirmasi');
      
      table.integer('shipmode_id').references('shipmode_id').inTable('dim_shipmode')
        .onDelete('CASCADE').onUpdate('CASCADE');
      
      table.string('postalcode').references('postal_code').inTable('dim_region')
        .onDelete('CASCADE').onUpdate('CASCADE'); 
      
      table.timestamps(true, true);
    })

    // =========================================
    // 4. FACT TABLE (DATA WAREHOUSE)
    // =========================================

    // 4.1 FACT SALES
    .createTable('fact_sales', function(table) {
      table.increments('row_id').primary();
      
      // Relasi ke tabel order (Opsional, tapi bagus untuk integritas)
      table.string('order_id'); 
      table.date('order_date_id').references('date_id').inTable('dim_date');
      table.date('ship_date_id').nullable().references('date_id').inTable('dim_date'); 
      table.string('product_id').references('product_id').inTable('dim_product');
      table.string('customer_id').references('customer_id').inTable('dim_customer');
      table.string('postalcode').references('postal_code').inTable('dim_region');
      table.integer('shipmode_id').references('shipmode_id').inTable('dim_shipmode');

      // Measures
      table.integer('quantity');
      table.decimal('sales', 15, 2);
      
      // Indexing untuk Performa Dashboard BI
      table.index(['order_date_id']);
      table.index(['product_id']);
      table.index(['customer_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('fact_sales')
    .dropTableIfExists('tabel_order') // Drop tabel baru
    .dropTableIfExists('cart')        // Drop tabel cart
    .dropTableIfExists('akun')       
    .dropTableIfExists('dim_product') // Product harus didrop sebelum Sub Category
    .dropTableIfExists('dim_sub_category')
    .dropTableIfExists('dim_kategori')
    .dropTableIfExists('dim_customer') // Customer harus didrop setelah akun/cart/order
    .dropTableIfExists('dim_date')
    .dropTableIfExists('dim_shipmode')
    .dropTableIfExists('dim_region')
    .dropTableIfExists('user_role');
};