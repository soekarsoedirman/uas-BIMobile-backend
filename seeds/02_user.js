const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  //hash admin123
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  // bersihkan data tabel
  await knex('akun').del();
  await knex('user_role').del();

  // inisiasi role id
  await knex('user_role').insert([
    { role_id: 1, role_name: 'admin' },
    { role_id: 2, role_name: 'customer' }
  ]);

  // akun dumi
  await knex('akun').insert([
    { 
      email: 'admin@toko.com', 
      password: hashedPassword, //admin123 
      id_role: 1, 
      customer_id: null 
    }
  ]);
};