// seeds/01_import_csv.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Fungsi pembantu membaca CSV ke Array Object
const readCSV = (fileName) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../output_tables', fileName)) // Pastikan path folder benar
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

exports.seed = async function(knex) {
  // 1. Bersihkan Data Lama (Urutan terbalik agar tidak error FK)
  await knex('fact_sales').del();
  await knex('dim_product').del();
  await knex('dim_sub_category').del();
  await knex('dim_kategori').del();
  await knex('dim_customer').del();
  await knex('dim_region').del();
  await knex('dim_shipmode').del();
  await knex('dim_date').del();

  console.log('Data lama dihapus. Memulai import...');

  // 2. Baca CSV (Pastikan file CSV hasil Python ada di folder output_tables)
  const kategoriData = await readCSV('dim_kategori.csv');
  const subCategoryData = await readCSV('dim_sub_category.csv');
  const productData = await readCSV('dim_product.csv');
  const customerData = await readCSV('dim_customer.csv');
  const regionData = await readCSV('dim_region.csv');
  const shipModeData = await readCSV('dim_shipmode.csv');
  const dateData = await readCSV('dim_date.csv');
  const factData = await readCSV('fact_sales.csv');

  // 3. Insert ke Database (Urutan Parent -> Child)
  
  // A. Kategori
  await knex.batchInsert('dim_kategori', kategoriData, 100);
  console.log('Dim Kategori seeded');

  // B. Sub Kategori
  await knex.batchInsert('dim_sub_category', subCategoryData, 100);
  console.log('Dim Sub Category seeded');

  // C. Produk
  await knex.batchInsert('dim_product', productData, 100);
  console.log('Dim Product seeded');

  // D. Customer
  await knex.batchInsert('dim_customer', customerData, 100);
  console.log('Dim Customer seeded');

  // E. Region
  await knex.batchInsert('dim_region', regionData, 100);
  console.log('Dim Region seeded');

  // F. Ship Mode
  await knex.batchInsert('dim_shipmode', shipModeData, 100);
  console.log('Dim Ship Mode seeded');

  // G. Date
  await knex.batchInsert('dim_date', dateData, 100);
  console.log('Dim Date seeded');

  // H. Fact Sales (Tabel paling besar)
  // Kita insert per 1000 baris agar tidak timeout
  await knex.batchInsert('fact_sales', factData, 1000);
  console.log('Fact Sales seeded successfully!');
};