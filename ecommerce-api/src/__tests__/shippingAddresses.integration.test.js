import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import ShippingAddress from '../models/shippingAddress.js';
import bcrypt from 'bcrypt';

describe('Shipping Addresses Integration Tests', () => {
  let token;
  let user;

  beforeEach(async () => {
    await User.deleteMany({});
    await ShippingAddress.deleteMany({});

    const hashPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      displayName: 'Shipping Tester',
      email: 'shipper@test.com',
      hashPassword,
      role: 'customer'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'shipper@test.com', password: 'password123' });

    token = loginRes.body.token;
  });

  const validAddress = {
    name: 'Home Address',
    address: '123 Main St',
    city: 'Testville',
    state: 'Test State',
    postalCode: '12345',
    country: 'Testland',
    phone: '1234567890',
    addressType: 'home'
  };

  it('INT-SA-01 should create a new shipping address', async () => {
    const res = await request(app)
      .post('/api/shipping-address')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validAddress, isDefault: true });

    expect(res.status).toBe(201);
    expect(res.body.address.name).toBe('Home Address');
    expect(res.body.address.isDefault).toBe(true);
  });

  it('INT-SA-02 should get all addresses for the authenticated user', async () => {
    await request(app)
      .post('/api/shipping-address')
      .set('Authorization', `Bearer ${token}`)
      .send(validAddress);

    const res = await request(app)
      .get('/api/shipping-address')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.addresses).toHaveLength(1);
    expect(res.body.addresses[0].city).toBe('Testville');
  });

  it('INT-SA-03 should update a shipping address', async () => {
    const createRes = await request(app)
      .post('/api/shipping-address')
      .set('Authorization', `Bearer ${token}`)
      .send(validAddress);

    const addressId = createRes.body.address._id;

    const res = await request(app)
      .put(`/api/shipping-address/${addressId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        city: 'New City',
        addressType: 'work'
      });

    expect(res.status).toBe(200);
    expect(res.body.address.city).toBe('New City');
    expect(res.body.address.addressType).toBe('work');
  });

  it('INT-SA-04 should set an address as default', async () => {
    const createRes = await request(app)
      .post('/api/shipping-address')
      .set('Authorization', `Bearer ${token}`)
      .send(validAddress);

    const addressId = createRes.body.address._id;

    const res = await request(app)
      .patch(`/api/shipping-address/${addressId}/default`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.address.isDefault).toBe(true);

    const defRes = await request(app)
      .get('/api/shipping-address/default')
      .set('Authorization', `Bearer ${token}`);

    expect(defRes.status).toBe(200);
    expect(defRes.body.address._id.toString()).toBe(addressId);
  });

  it('INT-SA-05 should delete a shipping address', async () => {
    const createRes = await request(app)
      .post('/api/shipping-address')
      .set('Authorization', `Bearer ${token}`)
      .send(validAddress);

    const addressId = createRes.body.address._id;

    const res = await request(app)
      .delete(`/api/shipping-address/${addressId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('SEC-SA-01: User cannot delete or update another user\'s address (IDOR)', async () => {
    // 1. Create User B and their address
    const hashB = await bcrypt.hash('password456', 10);
    const userB = await User.create({
      displayName: 'Victim User',
      email: 'victim@test.com',
      hashPassword: hashB,
      role: 'customer'
    });

    const addressB = await ShippingAddress.create({
      user: userB._id,
      ...validAddress,
      name: 'Victim Address'
    });

    // 2. User A (the main shipper) tries to delete B's address
    const res = await request(app)
      .delete(`/api/shipping-address/${addressB._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404); // Should return 404 since it's "not found" for User A

    // 3. User A tries to get B's address details
    const getRes = await request(app)
      .get(`/api/shipping-address/${addressB._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });
});
