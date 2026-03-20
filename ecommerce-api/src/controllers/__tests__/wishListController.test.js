import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserWishList, addToWishList, removeFromWishList, clearWishList, checkProductInWishList } from '../wishListController.js';

// Mock mongoose models
vi.mock('../../models/wishList.js');
vi.mock('../../models/product.js');

import WishList from '../../models/wishList.js';
import Product from '../../models/product.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  user: { userId: 'user123' },
  params: {},
  body: {},
  ...overrides
});

describe('WishListController - Unit Tests (Error Paths)', () => {
  beforeEach(() => vi.clearAllMocks());

  // -----------------------------------------------------------------------
  // getUserWishList
  // -----------------------------------------------------------------------
  describe('getUserWishList', () => {
    it('should return empty wishlist when none exists', async () => {
      WishList.findOne = vi.fn().mockReturnValue({ populate: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }) });
      const req = mockReq();
      const res = mockRes();
      await getUserWishList(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 0 }));
    });

    it('should call next on DB error', async () => {
      WishList.findOne = vi.fn().mockReturnValue({ populate: vi.fn().mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) }) });
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();
      await getUserWishList(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // addToWishList
  // -----------------------------------------------------------------------
  describe('addToWishList', () => {
    it('should return 404 when product does not exist', async () => {
      Product.findById = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
      const req = mockReq({ body: { productId: 'prod123' } });
      const res = mockRes();
      await addToWishList(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    it('should call next on DB error in Product.findById', async () => {
      Product.findById = vi.fn().mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) });
      const req = mockReq({ body: { productId: 'prod123' } });
      const res = mockRes();
      const next = vi.fn();
      await addToWishList(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next on DB error in WishList.findOneAndUpdate', async () => {
      Product.findById = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: 'prod123', name: 'Test' }) });
      WishList.findOneAndUpdate = vi.fn().mockReturnValue({ populate: vi.fn().mockRejectedValue(new Error('DB error')) });
      const req = mockReq({ body: { productId: 'prod123' } });
      const res = mockRes();
      const next = vi.fn();
      await addToWishList(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // removeFromWishList
  // -----------------------------------------------------------------------
  describe('removeFromWishList', () => {
    it('should return 404 when wishlist not found', async () => {
      WishList.findOneAndUpdate = vi.fn().mockReturnValue({ populate: vi.fn().mockResolvedValue(null) });
      const req = mockReq({ params: { productId: 'prod123' } });
      const res = mockRes();
      await removeFromWishList(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Wishlist not found' });
    });

    it('should call next on DB error', async () => {
      WishList.findOneAndUpdate = vi.fn().mockReturnValue({ populate: vi.fn().mockRejectedValue(new Error('DB error')) });
      const req = mockReq({ params: { productId: 'prod123' } });
      const res = mockRes();
      const next = vi.fn();
      await removeFromWishList(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // clearWishList
  // -----------------------------------------------------------------------
  describe('clearWishList', () => {
    it('should create empty wishlist if none existed', async () => {
      const newWl = { user: 'user123', products: [] };
      WishList.findOneAndUpdate = vi.fn().mockResolvedValue(null);
      WishList.create = vi.fn().mockResolvedValue(newWl);
      const req = mockReq();
      const res = mockRes();
      await clearWishList(req, res, vi.fn());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 0 }));
    });

    it('should call next on DB error', async () => {
      WishList.findOneAndUpdate = vi.fn().mockRejectedValue(new Error('DB error'));
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();
      await clearWishList(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -----------------------------------------------------------------------
  // checkProductInWishList
  // -----------------------------------------------------------------------
  describe('checkProductInWishList', () => {
    it('should return inWishList: false when wishlist is empty', async () => {
      WishList.findOne = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
      const req = mockReq({ params: { productId: 'prod123' } });
      const res = mockRes();
      await checkProductInWishList(req, res, vi.fn());
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ inWishList: false }));
    });

    it('should return inWishList: true when product is found', async () => {
      WishList.findOne = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ products: [{ product: 'prod123' }] }) });
      const req = mockReq({ params: { productId: 'prod123' } });
      const res = mockRes();
      await checkProductInWishList(req, res, vi.fn());
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ inWishList: true }));
    });

    it('should call next on DB error', async () => {
      WishList.findOne = vi.fn().mockReturnValue({ lean: vi.fn().mockRejectedValue(new Error('DB error')) });
      const req = mockReq({ params: { productId: 'prod123' } });
      const res = mockRes();
      const next = vi.fn();
      await checkProductInWishList(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
