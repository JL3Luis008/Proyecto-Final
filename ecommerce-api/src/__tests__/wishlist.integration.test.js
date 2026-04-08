import { describe, expect, it, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import WishList from '../models/wishList.js';
import bcrypt from 'bcrypt';

describe('Wishlist Integration Tests', () => {
  let token;
  let user;
  let product;

  beforeEach(async () => {
    const hashPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      displayName: 'Test User',
      email: 'wishlist-test@test.com',
      hashPassword,
      role: 'customer'
    });

    product = await Product.create({
      name: 'Test Product',
      description: 'A product for testing',
      price: 100,
      stock: 10,
      company: 'Test Company',
      category: new mongoose.Types.ObjectId(),
      inStock: true,
      region: 'Global',
      condition: 'New',
      includes: 'Product only',
      details: 'Test product for wishlist testing'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wishlist-test@test.com', password: 'password123' });

    token = loginRes.body.token;
  });

  it('INT-WL-01 should get an empty wishlist initially', async () => {
    const res = await request(app)
      .get('/api/wishList')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it('INT-WL-02 should add a product to the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishList/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product added to wishlist successfully');
    expect(res.body.wishList.products).toHaveLength(1);
    expect(res.body.wishList.products[0].product._id.toString()).toBe(product._id.toString());
  });

  it('INT-WL-03 should check if a product is in wishlist', async () => {
    await request(app)
      .post('/api/wishList/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id });

    const res = await request(app)
      .get(`/api/wishList/check/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.inWishList).toBe(true);
  });

  it('INT-WL-04 should remove a product from the wishlist', async () => {
    await request(app)
      .post('/api/wishList/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id });

    const res = await request(app)
      .delete(`/api/wishList/remove/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it('INT-WL-05 should clear the entire wishlist', async () => {
    await request(app)
      .post('/api/wishList/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id });

    const res = await request(app)
      .delete('/api/wishList/clear')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });
});
