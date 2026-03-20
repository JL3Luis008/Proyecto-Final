import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Re-creating the middleware for pure validation without environment skip
const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many authentication attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

const app = express();
app.use(testLimiter);
app.post('/test', (req, res) => res.status(200).send('OK'));

async function runTest() {
    console.log('Starting Rate Limiter Validation (Max: 5 requests)...');

    for (let i = 1; i <= 6; i++) {
        const res = await request(app).post('/test');
        if (i <= 5) {
            if (res.status === 200) {
                console.log(`Request ${i}: Success (200)`);
            } else {
                console.error(`Request ${i}: Unexpected status ${res.status}`);
                process.exit(1);
            }
        } else {
            if (res.status === 429) {
                console.log(`Request ${i}: Blocked (429) ✅ - Rate Limiter is WORKING`);
                console.log('Response body:', res.body);
            } else {
                console.error(`Request ${i}: Failed to block! Status: ${res.status}`);
                process.exit(1);
            }
        }
    }
}

runTest().catch(console.error);
