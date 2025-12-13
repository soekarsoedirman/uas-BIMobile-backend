exports.up = function(knex) {
  return knex.schema.createTable('cart', function(table) {
    table.increments('cart_id').primary(); 
    
    table.string('customer_id').notNullable(); 
    table.foreign('customer_id').references('customer_id').inTable('dim_customer')
      .onDelete('CASCADE').onUpdate('CASCADE');

    table.string('product_id').notNullable();
    table.foreign('product_id').references('product_id').inTable('dim_product')
      .onDelete('CASCADE').onUpdate('CASCADE');

    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cart');
};