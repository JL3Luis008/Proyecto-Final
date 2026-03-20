import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import Category from '../models/category.js';
import bcrypt from 'bcrypt';

describe('Category Integration Tests', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});

    const hashPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      displayName: 'Admin Tester',
      email: 'admin@test.com',
      hashPassword,
      role: 'admin'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });

    token = loginRes.body.token;
  });

  it('INT-CAT-01 should create a new category (admin)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Electronics',
        description: 'All electronic products'
      });

    expect(res.status).toBe(201);
    // Controller returns the category directly (no wrapper object)
    expect(res.body.name).toBe('Electronics');
  });

  it('INT-CAT-02 should get all categories (public)', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Books', description: 'Books and publications' });

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    // Controller returns a plain array
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('INT-CAT-03 should get a category by id (public)', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Clothing', description: 'Apparel and accessories' });

    const catId = createRes.body._id;

    const res = await request(app).get(`/api/categories/${catId}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Clothing');
  });

  it('INT-CAT-04 should update a category (admin)', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Toys', description: 'Fun for kids' });

    const catId = createRes.body._id;

    const res = await request(app)
      .put(`/api/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Toys & Games' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Toys & Games');
  });

  it('INT-CAT-05 should delete a category (admin)', async () => {
    const createRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Temp Category', description: 'Will be deleted' });

    const catId = createRes.body._id;

    const res = await request(app)
      .delete(`/api/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`);

    // Controller returns 204 with no body on success
    expect(res.status).toBe(204);
  });
});
