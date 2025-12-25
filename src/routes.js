const Joi = require("@hapi/joi");
const { authlogin, authregister, authlogout}= require('./handler/handler_auth');
const { home, search, product_detail, addcart, cartlist, cartdrop, order, orderlst } = require('./handler/handler_customer');
const { dashboard, addproduct, editproduct, deleteproduct, statistik, orderlist, orderconfirm, orderdetail }= require('./handler/handlre_admin');
const routes = [

    //auth
    //auth
    {
        method: 'POST',
        path: '/login',
        options: { 
            auth: false,
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                })
            }
        }, 
        handler: authlogin,
    },
    {
        method: 'POST',
        path: '/register',
        options: { 
            auth: false,
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().min(6).required(),
                    roleID: Joi.number().integer().valid(1, 2).required(), 
                    username: Joi.string().min(3).required(),
                    segmen: Joi.string().min(3).required(),
                })
            }
        }, 
        handler: authregister,
    },
    {
        method: 'POST',
        path: '/logout',
        options: {
            auth: false 
        },
        handler: authlogout,
    },

    //customer
    //customer
    {
        method: 'GET',
        path: '/home',
        handler: home,
    },
    {
        method: 'GET',
        path: '/products',
        handler: search,
    },
    {
        method: 'GET',
        path: '/products/{id}',
        handler: product_detail,
    },
    {
        method: 'POST',
        path: '/products/{id}/cart',
        options:{
            validate:{
                payload:Joi.object({
                    quantity: Joi.number().integer().required(),
                })
            }
        },
        handler: addcart,
    },
    {
        method: 'GET',
        path: '/cart',
        handler: cartlist,
    },
    {
        method: 'DELETE',
        path: '/cart/{id}',
        handler: cartdrop,
    },
    {
        method: 'POST',
        path: '/order',
        options:{
            validate:{
                payload:Joi.object({
                    postal_code: Joi.string().min(5).required(),
                    state: Joi.string().min(3).required(),
                    city: Joi.string().min(3).required(),
                    region: Joi.string().min(3).required(),
                    shipmode_id: Joi.number().integer().required(),
                })
            }
        },
        handler: order,
    },
    {
        method: 'GET',
        path: '/order/list',
        handler: orderlst,
    },

    //admin
    //admin
    {
        method: 'GET',
        path: '/dashboard',
        handler: dashboard,
    },
    {
        method: 'GET',
        path: '/statistik',
        handler: statistik,
    },
    {
        method: 'POST',
        path: '/products',
        options:{
            validate:{
                payload:Joi.object({
                    product_name: Joi.string().min(3).required(),
                    price: Joi.number().required(),
                    subkategori_id: Joi.number().integer().required(),
                })
            }
        },
        handler: addproduct,
    },
    {
        method: 'POST',
        path: '/products/{id}',
        options:{
            validate:{
                payload:Joi.object({
                    product_name: Joi.string().min(3).required(),
                    price: Joi.number().required(),
                    subkategori_id: Joi.number().integer().required(),
                }),
                failAction: (request, h, err) => {
                throw err;
            }
            }
        },
        handler: editproduct,
    },
    {
        method: 'DELETE',
        path: '/products/{id}',
        handler: deleteproduct,
    },
    {
        method: 'GET',
        path: '/order',
        handler: orderlist,
    },
    {
        method: 'GET',
        path: '/order/{id}',
        handler: orderdetail,
    },
    {
        method: 'POST',
        path: '/order/{id}',
        handler: orderconfirm,
    },
    
]

module.exports = routes;