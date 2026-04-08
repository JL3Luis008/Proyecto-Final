import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import ShippingAddress from '../models/shippingAddress.js';
import Review from '../models/Review.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import Category from '../models/category.js';
import PaymentMethod from '../models/paymentMethod.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import 'dotenv/config';

describe('Security Audit: IDOR Protection', () => {
    let userA, userB;
    let tokenA, tokenB;
    let addressB, productB, paymentMethodB, orderB;

    beforeEach(async () => {
        const secret = process.env.JWT_SECRET || 'secret';

        // 1. Create Users
        const hash = await bcrypt.hash('password123', 10);
        userA = await User.create({
            displayName: 'User A',
            email: `a${Date.now()}@test.com`,
            hashPassword: hash,
            role: 'customer'
        });
        tokenA = jwt.sign({ userId: userA._id.toString(), role: 'customer' }, secret);

        userB = await User.create({
            displayName: 'User B',
            email: `b${Date.now()}@test.com`,
            hashPassword: hash,
            role: 'customer'
        });
        tokenB = jwt.sign({ userId: userB._id.toString(), role: 'customer' }, secret);

        // 2. Create Category and Product
        const category = await Category.create({ name: 'Test Category', description: 'Test Description' });
        productB = await Product.create({
            name: 'Security Test Product',
            price: 100,
            description: 'Desc',
            stock: 10,
            company: 'Test Co',
            category: category._id,
            region: 'Global',
            condition: 'New',
            includes: 'Product',
            details: 'Details'
        });

        // 3. Create Resources for User B
        addressB = await ShippingAddress.create({
            user: userB._id,
            name: 'B Address',
            address: 'Victim Lane',
            city: 'SafeCity',
            state: 'SS',
            postalCode: '00000',
            country: 'México',
            phone: '00000000',
            isDefault: true,
            addressType: 'home'
        });

        paymentMethodB = await PaymentMethod.create({
            user: userB._id,
            type: 'paypal',
            paypalEmail: 'b@test.com',
            isDefault: true
        });

        orderB = await Order.create({
            user: userB._id,
            products: [{ productId: productB._id, quantity: 1, price: 100 }],
            shippingAddress: addressB._id,
            paymentMethod: paymentMethodB._id,
            totalPrice: 100,
            status: 'pending'
        });
    });

    it('SEC-IDOR-01: User A cannot delete User B shipping address', async () => {
        const res = await request(app)
            .delete(`/api/shipping-address/${addressB._id}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.status).toBe(404); // Controller returns 404 if not found for THIS user

        const stillExists = await ShippingAddress.findById(addressB._id);
        expect(stillExists).not.toBeNull();
    });

    it('SEC-IDOR-02: User A cannot delete User B payment method', async () => {
        const res = await request(app)
            .delete(`/api/payment-methods/${paymentMethodB._id}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.status).toBe(403); // Controller returns 403 via assertCanManagePaymentMethod

        const stillExists = await PaymentMethod.findById(paymentMethodB._id);
        expect(stillExists).not.toBeNull();
    });

    it('SEC-IDOR-03: User A cannot view User B order details', async () => {
        const res = await request(app)
            .get(`/api/orders/${orderB._id}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.status).toBe(403);
    });

    it('SEC-IDOR-04: User A cannot spoof order ownership on creation', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                user: userB._id.toString(), // Attempt to spoof owner
                products: [{ productId: productB._id.toString(), quantity: 1, price: 100 }],
                shippingAddress: addressB._id.toString(), // Note: the controller doesn't check address ownership yet, but that's a different test
                paymentMethod: paymentMethodB._id.toString(),
                shippingCost: 0
            });

        expect(res.status).toBe(201);
        expect(res.body.user._id.toString()).toBe(userA._id.toString()); // Must be A, not B
    });
});
