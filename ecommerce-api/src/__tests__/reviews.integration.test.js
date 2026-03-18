import { describe, expect, it, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';
import Review from '../models/review.js';
import bcrypt from 'bcrypt';

describe('Reviews Integration Tests', () => {
  let token;
  let user;
  let product;

  beforeEach(async () => {
    const hashPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      displayName: 'Reviewer Test',
      email: 'reviewer@test.com',
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
      inStock: true
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reviewer@test.com', password: 'password123' });

    token = loginRes.body.token;
  });

  it('INT-RE-01 should create a new review', async () => {
    const res = await request(app)
      .post('/api/review')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product: product._id,
        rating: 5,
        comment: 'Great product!'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Review created successfully');
    expect(res.body.review.rating).toBe(5);
  });

  it('INT-RE-02 should get reviews for a specific product', async () => {
    await request(app)
      .post('/api/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ product: product._id, rating: 4, comment: 'Good' });

    const res = await request(app)
      .get(`/api/review/product/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].comment).toBe('Good');
  });

  it('INT-RE-03 should get my reviews (authenticated user)', async () => {
    await request(app)
      .post('/api/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ product: product._id, rating: 4, comment: 'My Review' });

    const res = await request(app)
      .get('/api/my-reviews')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].user.toString()).toBe(user._id.toString());
  });

  it('INT-RE-04 should update an existing review', async () => {
    const createRes = await request(app)
      .post('/api/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ product: product._id, rating: 3, comment: 'Okay' });

    const reviewId = createRes.body.review._id;

    const res = await request(app)
      .put(`/api/review/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        comment: 'Actually better than okay'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Review updated successfully');
    expect(res.body.review.rating).toBe(5);
    expect(res.body.review.comment).toBe('Actually better than okay');
  });

  it('INT-RE-05 should delete an existing review', async () => {
    const createRes = await request(app)
      .post('/api/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ product: product._id, rating: 3, comment: 'Okay' });

    const reviewId = createRes.body.review._id;

    const res = await request(app)
      .delete(`/api/review/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Review deleted successfully');
  });

  it('SEC-RE-01: User cannot update or delete another user\'s review (IDOR)', async () => {
    // 1. Create Review as User B
    const userB = await User.create({
      displayName: 'Victim User',
      email: 'victim_rev@test.com',
      hashPassword: 'hashed',
      role: 'customer'
    });

    const reviewB = await Review.create({
      user: userB._id,
      product: product._id,
      rating: 1,
      comment: 'B\'s Secret Review'
    });

    // 2. User A tries to update B's review
    const res = await request(app)
      .put(`/api/review/${reviewB._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Hacked!' });

    expect(res.status).toBe(404); // "Not found" for User A
  });
});
