import { describe, expect, it, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import bcrypt from 'bcrypt';

describe('Reviews Integration Tests', () => {
  let token;
  let user;
  let product;

  beforeEach(async () => {
    const hashPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      displayName: 'Reviewer Test',
      email: `reviewer${Date.now()}@test.com`,
      hashPassword,
      role: 'customer'
    });

    product = await Product.create({
      name: 'Reviewable Product',
      description: 'Test product for reviews',
      price: 50,
      stock: 5,
      company: 'Test Company',
      category: new mongoose.Types.ObjectId(),
      inStock: true,
      region: 'Global',
      condition: 'New',
      includes: 'Product only',
      details: 'Test product for review testing'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'password123' });

    token = loginRes.body.token;
  });

  it('INT-RE-01 should create a new review via /products/:id/reviews', async () => {
    const res = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        comment: 'Great product!'
      });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
  });

  it('INT-RE-02 should get reviews for a specific product via /products/:id/reviews', async () => {
    // Create a review first
    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Good' });

    const res = await request(app)
      .get(`/api/products/${product._id}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('INT-RE-03 should return 400 when user tries to review same product twice', async () => {
    // Create first review
    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Great' });

    // Try to create duplicate review
    const res = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3, comment: 'Changed my mind' });

    expect(res.status).toBe(400);
  });
});
