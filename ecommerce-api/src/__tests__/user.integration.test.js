import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('User Integration Tests (INT-US)', () => {
    let token, userId, adminToken;

    beforeEach(async () => {
        // 1. Usuario normal
        const user = await User.create({
            displayName: 'Regular User',
            email: `user${Date.now()}@test.com`,
            hashPassword: await bcrypt.hash('password123', 10),
            role: 'customer'
        });
        userId = user._id;
        token = jwt.sign({ userId, displayName: user.displayName, role: 'customer' }, process.env.JWT_SECRET || 'secret');

        // 2. Admin
        const admin = await User.create({
            displayName: 'Admin User',
            email: `admin${Date.now()}@test.com`,
            hashPassword: await bcrypt.hash('password123', 10),
            role: 'admin'
        });
        adminToken = jwt.sign({ userId: admin._id, displayName: admin.displayName, role: 'admin' }, process.env.JWT_SECRET || 'secret');
    });

    it('INT-US-01 Obtener perfil propio', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user.displayName).toBe('Regular User');
    });

    it('INT-US-02 Actualizar perfil', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                displayName: 'Updated Name'
            });

        expect(res.status).toBe(200);
        expect(res.body.user.displayName).toBe('Updated Name');
    });

    it('INT-US-03 Admin puede listar todos los usuarios', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    });

    it('INT-US-04 Usuario no-admin no puede listar usuarios → 403', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});
