import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import PaymentMethod from '../models/paymentMethod.js';
import bcrypt from 'bcrypt';

describe('Payment Methods Integration Tests', () => {
  let token;
  let user;

  beforeEach(async () => {
    await User.deleteMany({});
    await PaymentMethod.deleteMany({});

    const hashPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      displayName: 'Payment Tester',
      email: 'payer@test.com',
      hashPassword,
      role: 'customer'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'payer@test.com', password: 'password123' });

    token = loginRes.body.token;
  });

  it('INT-PM-01 should create a new payment method (credit card)', async () => {
    const res = await request(app)
      .post('/api/payment-methods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentType: 'credit_card',
        cardNumber: '1234567890123456',
        cardHolderName: 'Payer Tester',
        expiryDate: '12/28',
        isDefault: true
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Payment method created successfully');
    expect(res.body.paymentMethod.paymentType).toBe('credit_card');
  });

  it('INT-PM-02 should get all payment methods for the authenticated user', async () => {
    await request(app)
      .post('/api/payment-methods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentType: 'paypal',
        paypalEmail: 'payer@test.com'
      });

    const res = await request(app)
      .get('/api/payment-methods/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.paymentMethods).toHaveLength(1);
    expect(res.body.paymentMethods[0].paymentType).toBe('paypal');
  });

  it('INT-PM-03 should set a payment method as default', async () => {
    const createRes = await request(app)
      .post('/api/payment-methods')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentType: 'bank_transfer', bankName: 'Test Bank', accountNumber: '123456789' });

    const pmId = createRes.body.paymentMethod._id;

    const res = await request(app)
      .patch(`/api/payment-methods/${pmId}/set-default`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.paymentMethod.isDefault).toBe(true);

    const defRes = await request(app)
      .get('/api/payment-methods/default')
      .set('Authorization', `Bearer ${token}`);

    expect(defRes.status).toBe(200);
    expect(defRes.body.paymentMethod._id.toString()).toBe(pmId);
  });

  it('INT-PM-04 should delete a payment method', async () => {
    const createRes = await request(app)
      .post('/api/payment-methods')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentType: 'paypal', paypalEmail: 'delete@test.com' });

    const pmId = createRes.body.paymentMethod._id;

    const res = await request(app)
      .delete(`/api/payment-methods/${pmId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Payment method deleted successfully');
  });
});
