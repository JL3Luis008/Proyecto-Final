const SENSITIVE_FIELDS = ['password', 'token', 'refreshToken', 'cardNumber', 'expiryDate', 'cvv'];

const redact = (obj) => {
  const newObj = { ...obj };
  for (const key in newObj) {
    if (SENSITIVE_FIELDS.includes(key)) {
      newObj[key] = '[REDACTED]';
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      newObj[key] = redact(newObj[key]);
    }
  }
  return newObj;
};

const logger = (req, res, next) => {
  const dateTime = new Date().toISOString();
  console.log(`${dateTime} | ${req.method} ${req.url}`);

  // Log request body if not empty (sanitized)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = redact(req.body);
    // console.log('Body:', JSON.stringify(sanitizedBody)); // Keep commented out or use a better logger library
  }

  next();
};

export default logger;
