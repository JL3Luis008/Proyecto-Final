import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import ShippingAddress from '../models/shippingAddress.js';
import Review from '../models/review.js';
import Order from '../models/order.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import 'dotenv/config';

describe('Security Audit: IDOR Protection', () => {
    let userA, userB;
    let tokenA, tokenB;
    let addressB, reviewB, orderB;

    beforeEach(async () => {
        const secret = process.env.JWT_SECRET || 'secret';

        // 1. Create User A
        const hashA = await bcrypt.hash('passwordA', 10);
        userA = await User.create({
            displayName: 'User A',
            email: `a${Date.now()}@test.com`,
            hashPassword: hashA,
            role: 'customer'
        });
        tokenA = jwt.sign({ userId: userA._id.toString(), role: 'customer' }, secret);

        // 2. Create User B
        const hashB = await bcrypt.hash('passwordB', 10);
        userB = await User.create({
            displayName: 'User B',
            email: `b${Date.now()}@test.com`,
            hashPassword: hashB,
            role: 'customer'
        });
        tokenB = jwt.sign({ userId: userB._id.toString(), role: 'customer' }, secret);

        // 3. Create resources for User B
        addressB = await ShippingAddress.create({
            user: userB._id,
            name: 'B Address',
            address: 'Victim Lane',
            city: 'SafeCity',
            state: 'SS',
            postalCode: '00000',
            country: 'CountryB',
            phone: '00000000'
        });

        reviewB = await Review.create({
            user: userB._id,
            product: new User()._id, // Dummy ID
            rating: 5,
            comment: 'Secret Review'
        });

        orderB = await Order.create({
            user: userB._id,
            products: [],
            totalPrice: 100,
            status: 'pending'
        });
    });

    it('BASELINE: User B CAN delete THEIR OWN shipping address', async () => {
        const res = await request(app)
            .delete(`/api/shipping-address/${addressB._id}`)
            .set('Authorization', `Bearer ${tokenB}`);

        if (res.status !== 200) {
            throw new Error(`BASELINE Failed. Expected 200 but got ${res.status}. Body: ${JSON.stringify(res.body)}`);
        }
    });

    it('SEC-IDOR-01: User A cannot delete User B shipping address', async () => {
        const res = await request(app)
            .delete(`/api/shipping-address/${addressB._id}`)
            .set('Authorization', `Bearer ${tokenA}`);

        if (res.status !== 404) {
            throw new Error(`SEC-IDOR-01 Failed. Expected 404 but got ${res.status}. Body: ${JSON.stringify(res.body)}`);
        }
        // Or 403, but my code returns 404 for "not found for this user"

        // Verify still exists in DB
        const stillExists = await ShippingAddress.findById(addressB._id);
        expect(stillExists).not.toBeNull();
    });

    it('SEC-IDOR-02: User A cannot update User B review', async () => {
        const res = await request(app)
            .put(`/api/review/${reviewB._id}`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ comment: 'Hacked!' });

        if (res.status !== 404) {
            throw new Error(`SEC-IDOR-02 Failed. Expected 404 but got ${res.status}. Body: ${JSON.stringify(res.body)}`);
        }
        // Controller returns 404 "unauthorized"

        const freshReview = await Review.findById(reviewB._id);
        expect(freshReview.comment).toBe('Secret Review');
    });

    it('SEC-IDOR-03: User A cannot view User B order details', async () => {
        const res = await request(app)
            .get(`/api/orders/${orderB._id}`)
            .set('Authorization', `Bearer ${tokenA}`);

        if (res.status !== 403) {
            throw new Error(`SEC-IDOR-03 Failed. Expected 403 but got ${res.status}. Body: ${JSON.stringify(res.body)}`);
        }
        // Controller returns 403 for orders
    });

    it('SEC-IDOR-04: User A cannot spoof order ownership on creation', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                user: userB._id.toString(), // Attempt to spoof
                products: [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1, price: 50 }],
                shippingAddress: addressB._id.toString(),
                paymentMethod: addressB._id.toString()
            });

        if (res.status !== 201) {
            throw new Error(`SEC-IDOR-04 Failed. Expected 201 but got ${res.status}. Body: ${JSON.stringify(res.body)}`);
        }
        expect(res.body.user._id.toString()).toBe(userA._id.toString()); // Must be A, not B
    });
});
