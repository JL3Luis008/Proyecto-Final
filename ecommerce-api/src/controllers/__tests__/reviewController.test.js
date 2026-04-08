import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createReview, getProductReviews, getUserReviews, updateReview, deleteReview } from '../reviewController.js';

vi.mock('../../models/Review.js');
vi.mock('../../models/product.js');

import Review from '../../models/Review.js';
import Product from '../../models/product.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  user: { userId: 'user123' },
  params: {},
  body: {},
  ...overrides,
});

describe('ReviewController - Unit Tests (Error Paths)', () => {
  beforeEach(() => vi.clearAllMocks());

  // -----------------------------------------------------------------------
  // createReview
  // -----------------------------------------------------------------------
  describe('createReview', () => {
    it('should return 404 when product does not exist', async () => {
      Product.findById = vi.fn().mockResolvedValue(null);
      const req = mockReq({ params: { id: 'prod123' }, body: { rating: 5, comment: 'Great' } });
      const res = mockRes();
      await createReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    it('should return 400 when user already reviewed the product', async () => {
      Product.findById = vi.fn().mockResolvedValue({ _id: 'prod123' });
      Review.findOne = vi.fn().mockResolvedValue({ _id: 'rev999' });
      const req = mockReq({ params: { id: 'prod123' }, body: { rating: 5, comment: 'Great' } });
      const res = mockRes();
      await createReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product already reviewed' });
    });

    it('should call next on DB error', async () => {
      Product.findById = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ params: { id: 'prod123' }, body: { rating: 5, comment: 'Great' } });
      const res = mockRes();
      const next = vi.fn();
      await createReview(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // getProductReviews
  // -----------------------------------------------------------------------
  describe('getProductReviews', () => {
    it('should return reviews for a product', async () => {
      Product.findById = vi.fn().mockResolvedValue({ _id: 'prod123' });
      Review.find = vi.fn().mockReturnValue({ populate: vi.fn().mockResolvedValue([]) });
      const req = mockReq({ params: { id: 'prod123' } });
      const res = mockRes();
      await getProductReviews(req, res, vi.fn());
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should call next on DB error', async () => {
      Product.findById = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ params: { id: 'prod123' } });
      const next = vi.fn();
      await getProductReviews(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // getUserReviews
  // -----------------------------------------------------------------------
  describe('getUserReviews', () => {
    it('should call next on DB error', async () => {
      Review.find = vi.fn().mockReturnValue({ populate: vi.fn().mockRejectedValue(new Error('DB error')) });
      const req = mockReq();
      const next = vi.fn();
      await getUserReviews(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // updateReview
  // -----------------------------------------------------------------------
  describe('updateReview', () => {
    it('should return 400 when no field is provided', async () => {
      Review.findById = vi.fn().mockResolvedValue({ _id: 'rev123', user: { toString: () => 'user123' } });
      const req = mockReq({ params: { id: 'rev123' }, body: {} });
      const res = mockRes();
      await updateReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when review not found', async () => {
      Review.findById = vi.fn().mockResolvedValue(null);
      const req = mockReq({ params: { id: 'rev123' }, body: { rating: 5 } });
      const res = mockRes();
      await updateReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Review not found' });
    });

    it('should return 403 when user does not own the review', async () => {
      Review.findById = vi.fn().mockResolvedValue({ _id: 'rev123', user: { toString: () => 'other_user' } });
      const req = mockReq({ params: { id: 'rev123' }, body: { rating: 4 } });
      const res = mockRes();
      await updateReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should call next on DB error', async () => {
      Review.findById = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ params: { id: 'rev123' }, body: { rating: 5 } });
      const next = vi.fn();
      await updateReview(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // deleteReview
  // -----------------------------------------------------------------------
  describe('deleteReview', () => {
    it('should return 404 when review not found', async () => {
      Review.findById = vi.fn().mockResolvedValue(null);
      const req = mockReq({ params: { id: 'rev123' } });
      const res = mockRes();
      await deleteReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 when user does not own the review', async () => {
      Review.findById = vi.fn().mockResolvedValue({ _id: 'rev123', user: { toString: () => 'other_user' }, deleteOne: vi.fn() });
      const req = mockReq({ params: { id: 'rev123' } });
      const res = mockRes();
      await deleteReview(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should call next on DB error', async () => {
      Review.findById = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq({ params: { id: 'rev123' } });
      const next = vi.fn();
      await deleteReview(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
