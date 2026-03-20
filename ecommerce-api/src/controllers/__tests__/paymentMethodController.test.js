import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createPaymentMethod,
  getPaymentMethodsByUser,
  getDefaultPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod
} from '../paymentMethodController.js';

vi.mock('../../models/paymentMethod.js');
import PaymentMethod from '../../models/paymentMethod.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  user: { userId: 'user123', role: 'customer' },
  params: {},
  body: {},
  ...overrides,
});

describe('PaymentMethodController - Unit Tests (Error Paths)', () => {
  beforeEach(() => vi.clearAllMocks());

  // -----------------------------------------------------------------------
  // createPaymentMethod
  // -----------------------------------------------------------------------
  describe('createPaymentMethod', () => {
    it('should return 400 when payment type is invalid', async () => {
      const req = mockReq({ body: { type: 'bitcoin' } });
      const res = mockRes();
      await createPaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when credit_card is missing required fields', async () => {
      const req = mockReq({ body: { type: 'credit_card' } });
      const res = mockRes();
      await createPaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when paypal email is missing', async () => {
      const req = mockReq({ body: { type: 'paypal' } });
      const res = mockRes();
      await createPaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when bank_transfer is missing bankName/accountNumber', async () => {
      const req = mockReq({ body: { type: 'bank_transfer' } });
      const res = mockRes();
      await createPaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should call next on DB error during creation', async () => {
      PaymentMethod.updateMany = vi.fn().mockResolvedValue({});
      PaymentMethod.create = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ body: { type: 'paypal', paypalEmail: 'user@test.com', isDefault: true } });
      const next = vi.fn();
      await createPaymentMethod(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // getPaymentMethodsByUser
  // -----------------------------------------------------------------------
  describe('getPaymentMethodsByUser', () => {
    it('should return payment methods for user', async () => {
      const methods = [{ _id: 'pm1', type: 'paypal' }];
      PaymentMethod.find = vi.fn().mockReturnValue({ populate: vi.fn().mockResolvedValue(methods) });
      const req = mockReq();
      const res = mockRes();
      await getPaymentMethodsByUser(req, res, vi.fn());
      expect(res.json).toHaveBeenCalledWith(methods);
    });

    it('should call next on DB error', async () => {
      PaymentMethod.find = vi.fn().mockReturnValue({ populate: vi.fn().mockRejectedValue(new Error('DB error')) });
      const next = vi.fn();
      await getPaymentMethodsByUser(mockReq(), mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // getDefaultPaymentMethod
  // -----------------------------------------------------------------------
  describe('getDefaultPaymentMethod', () => {
    it('should return null when no default method found', async () => {
      PaymentMethod.findOne = vi.fn().mockReturnValue({ populate: vi.fn().mockResolvedValue(null) });
      const res = mockRes();
      await getDefaultPaymentMethod(mockReq(), res, vi.fn());
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it('should call next on DB error', async () => {
      PaymentMethod.findOne = vi.fn().mockReturnValue({ populate: vi.fn().mockRejectedValue(new Error('DB error')) });
      const next = vi.fn();
      await getDefaultPaymentMethod(mockReq(), mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // setDefaultPaymentMethod
  // -----------------------------------------------------------------------
  describe('setDefaultPaymentMethod', () => {
    it('should return 404 when payment method not found', async () => {
      PaymentMethod.findById = vi.fn().mockResolvedValue(null);
      const req = mockReq({ params: { id: 'pm123' } });
      const res = mockRes();
      await setDefaultPaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 for inactive payment method', async () => {
      PaymentMethod.findById = vi.fn().mockResolvedValue({
        _id: 'pm123',
        // The _id field is user 'user123', matching req.user.userId — ownership check passes
        user: 'user123',
        isActive: false
      });
      const req = mockReq({ params: { id: 'pm123' } });
      const res = mockRes();
      await setDefaultPaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should call next on DB error', async () => {
      PaymentMethod.findById = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ params: { id: 'pm123' } });
      const next = vi.fn();
      await setDefaultPaymentMethod(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // deletePaymentMethod
  // -----------------------------------------------------------------------
  describe('deletePaymentMethod', () => {
    it('should return 404 when payment method not found', async () => {
      PaymentMethod.findById = vi.fn().mockResolvedValue(null);
      const req = mockReq({ params: { id: 'pm123' } });
      const res = mockRes();
      await deletePaymentMethod(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should call next on DB error', async () => {
      PaymentMethod.findById = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ params: { id: 'pm123' } });
      const next = vi.fn();
      await deletePaymentMethod(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
