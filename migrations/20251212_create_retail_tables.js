exports.up = function(knex) {
  return knex.schema
    // =========================================
    // 0. USER ROLE (Master Data untuk Role)
    // =========================================
    .createTable('user_role', function(table) {
      table.integer('role_id').primary(); 
      table.string('role_name').notNullable();
    })

    // =========================================
    // 1. DIM KATEGORI
    // =========================================
    .createTable('dim_kategori', function(table) {
      table.integer('kategori_id').primary(); 
      table.string('kategori_name').notNullable();
    })
    // 2. DIM SUB CATEGORY 
    .createTable('dim_sub_category', function(table) {
      table.integer('subkategori_id').primary();
      table.string('subkategori_name').notNullable();
      
      table.integer('kategori_id').references('kategori_id').inTable('dim_kategori')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    // 3. DIM PRODUCT
    .createTable('dim_product', function(table) {
      table.string('product_id').primary(); 
      table.string('product_name', 500);    
      
      table.integer('subkategori_id').references('subkategori_id').inTable('dim_sub_category')
        .onDelete('CASCADE').onUpdate('CASCADE');
    })
    // 4. DIM CUSTOMER
    .createTable('dim_customer', function(table) {
      table.string('customer_id').primary();
      table.string('customer_name');
      table.string('segmen');
    })

    // =========================================
    // 4.5. TABEL AKUN (User Login)
    // =========================================
    // Diletakkan di sini karena butuh dim_customer sudah ada
    .createTable('akun', function(table) {
      table.string('email').primary(); // Primary Key
      table.string('password').notNullable();
      
      // Foreign Key ke User Role
      table.integer('id_role').references('role_id').inTable('user_role')
        .onDelete('CASCADE').onUpdate('CASCADE');

      // Foreign Key ke Dim Customer
      // Kita buat nullable, karena Admin mungkin punya akun tapi bukan customer
      table.string('customer_id').nullable(); 
      
      table.foreign('customer_id').references('customer_id').inTable('dim_customer')
        .onDelete('SET NULL').onUpdate('CASCADE');
    })

    // 5. DIM REGION
    .createTable('dim_region', function(table) {
      table.string('postal_code').primary(); 
      table.string('city');
      table.string('state');
      table.string('region');
      table.string('country');
    })
    // 6. DIM SHIPMODE
    .createTable('dim_shipmode', function(table) {
      table.integer('shipmode_id').primary();
      table.string('shipmode');
    })
    // 7. DIM DATE
    .createTable('dim_date', function(table) {
      table.date('date_id').primary(); 
      table.integer('day');
      table.integer('month');
      table.integer('year');
      table.integer('quarter');
      table.string('month_name');
      table.string('day_name');
    })
    // 8. FACT SALES
    .createTable('fact_sales', function(table) {
      table.integer('row_id').primary(); 
      table.string('order_id');
      
      // Foreign Keys
      table.date('order_date_id').references('date_id').inTable('dim_date');
      table.date('ship_date_id').references('date_id').inTable('dim_date'); 
      
      table.string('product_id').references('product_id').inTable('dim_product');
      table.string('customer_id').references('customer_id').inTable('dim_customer');
      table.string('postalcode').references('postal_code').inTable('dim_region');
      
      table.integer('shipmode_id').references('shipmode_id').inTable('dim_shipmode');
      
      // Measures
      table.decimal('sales', 15, 4); 
    });
};

exports.down = function(knex) {
  // Urutan drop dibalik (Anak dulu baru Induk)
  return knex.schema
    .dropTableIfExists('fact_sales')
    .dropTableIfExists('akun')       
    .dropTableIfExists('user_role')  
    .dropTableIfExists('dim_date')
    .dropTableIfExists('dim_shipmode')
    .dropTableIfExists('dim_region')
    .dropTableIfExists('dim_customer') 
    .dropTableIfExists('dim_product')
    .dropTableIfExists('dim_sub_category')
    .dropTableIfExists('dim_kategori');
};