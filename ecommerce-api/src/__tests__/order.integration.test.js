import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

describe('Order Integration Tests (INT-OR)', () => {
    let token, userId, productId;
    let customerToken, customerId;

    beforeEach(async () => {
        // 1. Usuario (Admin para permitir cancelación según rutas actuales)
        const user = await User.create({
            displayName: 'Order Admin',
            email: `order${Date.now()}@test.com`,
            hashPassword: await bcrypt.hash('password123', 10),
            role: 'admin'
        });
        userId = user._id;
        token = jwt.sign({ userId, displayName: user.displayName, role: 'admin' }, process.env.JWT_SECRET || 'secret');

        // 2. Producto con stock
        const product = await Product.create({
            name: 'Ordered Game',
            price: 60,
            description: 'Retro game',
            stock: 5,
            company: 'Nintendo'
        });
        productId = product._id;

        // 3. Customer user
        const customer = await User.create({
            displayName: 'Order Customer',
            email: `cust${Date.now()}@test.com`,
            hashPassword: await bcrypt.hash('password123', 10),
            role: 'customer'
        });
        customerId = customer._id;
        customerToken = jwt.sign({ userId: customerId, displayName: customer.displayName, role: 'customer' }, process.env.JWT_SECRET || 'secret');
    });

    it('INT-OR-01 Crear orden exitosamente (reduce stock)', async () => {
        const orderData = {
            products: [{ productId, quantity: 2, price: 60 }],
            shippingAddress: '65dbbe8c9d4b6c3a1c8b4567', // Valid MongoId
            paymentMethod: '65dbbe8c9d4b6c3a1c8b4568', // Valid MongoId
            shippingCost: 10
        };

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(orderData);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('status', 'pending');
        expect(res.body.products).toHaveLength(1);

        // Verificar stock reducido
        const updatedProduct = await Product.findById(productId);
        expect(updatedProduct.stock).toBe(3);
    });

    it('INT-OR-02 Cancelar orden (restaura stock)', async () => {
        // 1. Crear orden
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                user: userId,
                products: [{ productId, quantity: 1, price: 60 }],
                shippingAddress: '65dbbe8c9d4b6c3a1c8b4567',
                paymentMethod: '65dbbe8c9d4b6c3a1c8b4568',
                shippingCost: 10
            });
        const orderId = res.body._id; // Changed from createRes.body._id to res.body._id

        // 2. Cancelar
        const cancelRes = await request(app) // Changed from const res to const cancelRes to avoid redeclaration
            .patch(`/api/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`);

        expect(cancelRes.status).toBe(200);
        expect(cancelRes.body.order).toHaveProperty('status', 'cancelled');

        // Verificar stock restaurado
        const restoredProduct = await Product.findById(productId);
        expect(restoredProduct.stock).toBe(5);
    });

    it('INT-OR-03 Error si no hay suficiente stock', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                user: userId,
                products: [{ productId, quantity: 10, price: 60 }], // Solo hay 5
                shippingAddress: '65dbbe8c9d4b6c3a1c8b4567',
                paymentMethod: '65dbbe8c9d4b6c3a1c8b4568',
                shippingCost: 10
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('stock issues');
    });

    it('INT-OR-04 Obtener órdenes del usuario autenticado → array', async () => {
        // Crear una orden
        await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                user: userId,
                products: [{ productId, quantity: 1, price: 60 }],
                shippingAddress: '65dbbe8c9d4b6c3a1c8b4567',
                paymentMethod: '65dbbe8c9d4b6c3a1c8b4568',
                shippingCost: 10
            });

        const res = await request(app)
            .get(`/api/orders/user/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        if (res.status !== 200) {
            throw new Error(`INT-OR-04 Failed status: ${res.status} Body: ${JSON.stringify(res.body)}`);
        }
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('INT-OR-05 Admin actualiza status de orden → 200', async () => {
        const createRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                user: userId,
                products: [{ productId, quantity: 1, price: 60 }],
                shippingAddress: '65dbbe8c9d4b6c3a1c8b4567',
                paymentMethod: '65dbbe8c9d4b6c3a1c8b4568',
                shippingCost: 10
            });
        const orderId = createRes.body._id;

        const updateRes = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'shipped' });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body).toHaveProperty('status', 'shipped');
    });

    it('INT-OR-06 Customer intenta actualizar status → 403', async () => {
        const createRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                user: userId,
                products: [{ productId, quantity: 1, price: 60 }],
                shippingAddress: '65dbbe8c9d4b6c3a1c8b4567',
                paymentMethod: '65dbbe8c9d4b6c3a1c8b4568',
                shippingCost: 10
            });
        const orderId = createRes.body._id;

        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ status: 'shipped' });

        expect(res.status).toBe(403);
    });

    it('INT-OR-07 Sin token → 401', async () => {
        const res = await request(app).post('/api/orders').send({});
        expect(res.status).toBe(401);
    });

    it('SEC-OR-01: User cannot view another user\'s order (IDOR)', async () => {
        // 1. Create Order for User B
        const userB = await User.create({
            displayName: 'Victim',
            email: `victim${Date.now()}@test.com`,
            hashPassword: 'hashed',
            role: 'customer'
        });

        const orderB = await Order.create({
            user: userB._id,
            products: [{ productId: new mongoose.Types.ObjectId(), quantity: 1, price: 10 }],
            shippingAddress: new mongoose.Types.ObjectId(),
            paymentMethod: new mongoose.Types.ObjectId(),
            totalPrice: 100,
            status: 'pending'
        });

        // 2. Customer Token (User A) tries to view Order B
        const res = await request(app)
            .get(`/api/orders/${orderB._id.toString()}`)
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(403);
    });
});
