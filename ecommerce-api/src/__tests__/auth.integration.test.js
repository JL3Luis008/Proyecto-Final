import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../server.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

describe('Auth Integration Tests (INT-AU)', () => {

    const testUser = {
        displayName: 'Integration User',
        email: 'int@test.com',
        password: 'password123',
        role: 'customer'
    };

    describe('POST /api/auth/register', () => {
        it('INT-AU-01 Registro exitoso', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('displayName', testUser.displayName);
            expect(res.body).toHaveProperty('email', testUser.email);

            // Verificar en la DB
            const userInDb = await User.findOne({ email: testUser.email });
            expect(userInDb).toBeDefined();
            expect(userInDb.displayName).toBe(testUser.displayName);
        });

        it('INT-AU-02 Error si el email ya existe', async () => {
            // Pre-registrar el usuario
            await request(app).post('/api/auth/register').send(testUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'User already exist');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Asegurar un usuario para login
            const hashPassword = await bcrypt.hash(testUser.password, 10);
            await User.create({
                displayName: testUser.displayName,
                email: testUser.email,
                hashPassword,
                role: 'customer'
            });
        });

        it('INT-AU-03 Login exitoso', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('INT-AU-04 Credenciales inválidas (password incorrecta)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(400); // El controlador retorna 400 para Invalid credentials
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

    describe('POST /api/auth/refreshToken', () => {
        let refreshToken;

        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send(testUser);

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            refreshToken = loginRes.body.refreshToken;
        });

        it('INT-AU-05 Refrescar token exitosamente', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('refreshToken'); // El backend genera uno nuevo
        });

        it('INT-AU-06 Token inválido → 403', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalidtoken' });

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Invalid refresh token');
        });
    });
});
