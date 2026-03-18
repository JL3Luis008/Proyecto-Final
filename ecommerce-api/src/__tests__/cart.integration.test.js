import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import Cart from '../models/cart.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Cart Integration Tests (INT-CA)', () => {
    let token, userId, productId;

    beforeEach(async () => {
        // 1. Crear usuario y token
        const user = await User.create({
            displayName: 'Cart User',
            email: `cart${Date.now()}@test.com`,
            hashPassword: await bcrypt.hash('password123', 10),
            role: 'customer'
        });
        userId = user._id;
        token = jwt.sign({ userId, displayName: user.displayName, role: 'customer' }, process.env.JWT_SECRET || 'secret');

        // 2. Crear producto
        const product = await Product.create({
            name: 'Test Product',
            price: 100,
            description: 'Desc',
            stock: 10,
            company: 'Test Co'
        });
        productId = product._id;
    });

    it('INT-CA-01 Añadir producto al carrito (crea nuevo)', async () => {
        const res = await request(app)
            .post('/api/cart/add-product')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId: productId.toString(),
                quantity: 2
            });

        if (res.status !== 200) {
            throw new Error(`INT-CA-01 Failed: ${JSON.stringify(res.body)}`);
        }

        expect(res.body.cart.products).toHaveLength(1);
        expect(res.body.cart.products[0].quantity).toBe(2);

        // Verificar en DB
        const cartInDb = await Cart.findOne({ user: userId });
        expect(cartInDb.products[0].product.toString()).toBe(productId.toString());
    });

    it('INT-CA-02 Actualizar cantidad de item', async () => {
        // Primero añadir
        await request(app)
            .post('/api/cart/add-product')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: productId.toString(), quantity: 1 });

        // Luego actualizar
        const res = await request(app)
            .put('/api/cart/update-item')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId: productId.toString(),
                quantity: 5
            });

        if (res.status !== 200) {
            throw new Error(`INT-CA-02 Failed: ${JSON.stringify(res.body)}`);
        }

        expect(res.body.cart.products[0].quantity).toBe(5);
    });

    it('INT-CA-03 Vaciar carrito', async () => {
        // Añadir algo
        await request(app)
            .post('/api/cart/add-product')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId, quantity: 1 });

        const res = await request(app)
            .post('/api/cart/clear')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(200);
        expect(res.body.cart.products).toHaveLength(0);
    });

    it('INT-CA-04 Obtener mi carrito', async () => {
        const res = await request(app)
            .get('/api/cart/my-cart')
            .set('Authorization', `Bearer ${token}`);

        if (res.status !== 200) {
            throw new Error(`INT-CA-04 Failed status: ${res.status} Body: ${JSON.stringify(res.body)}`);
        }
        expect(res.body.message).toBe("No cart found for this user");
    });
});
