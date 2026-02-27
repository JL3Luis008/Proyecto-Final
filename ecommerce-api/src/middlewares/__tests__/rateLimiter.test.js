import { describe, it, expect, afterAll } from 'vitest'
import express from 'express'
import request from 'supertest'

import { authLimiter, apiLimiter, strictLimiter } from '../../middlewares/rateLimiter.js'

describe('RateLimiter Middlewares (test env skips)', () => {
  // Simple endpoint to verify middleware allows request through when skipped
  const createAppWith = (middleware) => {
    const app = express()
    app.use(express.json())
    app.get('/test', middleware, (_req, res) => res.status(200).send('ok'))
    return app
  }

  it('authLimiter should be skipped in test env', async () => {
    const app = createAppWith(authLimiter)
    const res = await request(app).get('/test')
    expect(res.status).toBe(200)
    // body not important; 200 status means middleware allowed through
  })

  it('apiLimiter should be skipped in test env', async () => {
    const app = createAppWith(apiLimiter)
    const res = await request(app).get('/test')
    expect(res.status).toBe(200)
  })

  it('strictLimiter should be skipped in test env', async () => {
    const app = createAppWith(strictLimiter)
    const res = await request(app).get('/test')
    expect(res.status).toBe(200)
  })
})
