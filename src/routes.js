const Joi = require("@hapi/joi");
const { authlogin, authregister, authlogout}= require('./handler/handler_auth');
const { home, search, product_detail, addcart, cartlist, cartdrop } = require('./handler/handler_customer');
const { dashboard, addproduct, editproduct, deleteproduct, statistik}= require('./handler/handlre_admin');
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
    // {
    //     method: 'POST',
    //     path: '/order',
    //     options: { 
    //         validate: {
    //             payload: Joi.object({
    //                 postalcode: Joi.string().min(5).required(),
    //                 city: Joi.string().min(2).required(),
    //                 state: Joi.string().min(2).required(),
    //                 region: Joi.string().min(2).required(),
    //                 country: Joi.string().min(2).required(),
    //                 shipmode_id: Joi.number().integer().required(),
    //             })
    //         }
    //     }, 
    //     handler: order,
    // },


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
                    subkategori_id: Joi.number().integer().required(),
                })
            }
        },
        handler: editproduct,
    },
    {
        method: 'DELETE',
        path: '/products/{id}',
        handler: deleteproduct,
    },

]

module.exports = routes;