import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  createShippingAddress,
  getUserAddresses,
  getAddressById,
  getDefaultAddress,
  updateShippingAddress,
  setDefaultAddress,
  deleteShippingAddress,
} from '../shippingAddressController.js';

// Mock ShippingAddress model
const { mockShippingAddress, mockSave } = vi.hoisted(() => {
  const mockSave = vi.fn().mockResolvedValue(true);
  const mockShippingAddress = vi.fn(function (data) {
    Object.assign(this, data);
    this.save = mockSave;
  });
  mockShippingAddress.find = vi.fn();
  mockShippingAddress.findById = vi.fn();
  mockShippingAddress.findOne = vi.fn();
  mockShippingAddress.findByIdAndDelete = vi.fn();
  mockShippingAddress.updateMany = vi.fn();
  return { mockShippingAddress, mockSave };
});

vi.mock('../../models/shippingAddress.js', () => ({ default: mockShippingAddress }));

import ShippingAddress from '../../models/shippingAddress.js';

function buildReqRes(overrides = {}) {
  const req = {
    user: { userId: 'user123' },
    params: {},
    body: {},
    ...overrides,
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('ShippingAddressController - Unit Tests (Error Paths)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createShippingAddress', () => {
    it('should return 201 and use Mexico if country not provided', async () => {
      const { req, res, next } = buildReqRes({ body: { name: 'Home', address: '123' } });
      await createShippingAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        address: expect.objectContaining({ country: 'México' })
      }));
    });

    it('should deselect other defaults if isDefault is true', async () => {
      const { req, res, next } = buildReqRes({ body: { isDefault: true } });
      ShippingAddress.updateMany.mockResolvedValue({});
      await createShippingAddress(req, res, next);
      expect(ShippingAddress.updateMany).toHaveBeenCalledWith(
        { user: 'user123' },
        { isDefault: false }
      );
    });

    it('should return 500 when updateMany fails', async () => {
      const { req, res, next } = buildReqRes({ body: { isDefault: true } });
      ShippingAddress.updateMany.mockRejectedValue(new Error('Update failed'));
      await createShippingAddress(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return 500 when save fails', async () => {
      const { req, res, next } = buildReqRes();
      mockSave.mockRejectedValueOnce(new Error('Save failed'));
      await createShippingAddress(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getUserAddresses', () => {
    it('should return 200 on success', async () => {
      const { req, res, next } = buildReqRes();
      ShippingAddress.find.mockReturnValue({ sort: vi.fn().mockResolvedValue([]) });
      await getUserAddresses(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      const { req, res, next } = buildReqRes();
      ShippingAddress.find.mockReturnValue({ sort: vi.fn().mockRejectedValue(new Error('Find failed')) });
      await getUserAddresses(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getAddressById', () => {
    it('should return 404 if not found', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockResolvedValue(null);
      await getAddressById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should call next on error', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockRejectedValue(new Error('FindOne failed'));
      await getAddressById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getDefaultAddress', () => {
    it('should return 404 if no default exists', async () => {
      const { req, res, next } = buildReqRes();
      ShippingAddress.findOne.mockResolvedValue(null);
      await getDefaultAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should call next on error', async () => {
      const { req, res, next } = buildReqRes();
      ShippingAddress.findOne.mockRejectedValue(new Error('FindOne error'));
      await getDefaultAddress(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateShippingAddress', () => {
    it('should return 400 if no fields are provided', async () => {
      const { req, res, next } = buildReqRes({ body: {} });
      await updateShippingAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if address not found', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' }, body: { name: 'New' } });
      ShippingAddress.findOne.mockResolvedValue(null);
      await updateShippingAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should update fields correctly and handle isDefault toggle', async () => {
      const mockAddr = { _id: '123', isDefault: false, save: vi.fn().mockResolvedValue(true) };
      const { req, res, next } = buildReqRes({ params: { addressId: '123' }, body: { name: 'New', isDefault: true } });
      ShippingAddress.findOne.mockResolvedValue(mockAddr);
      ShippingAddress.updateMany.mockResolvedValue({});

      await updateShippingAddress(req, res, next);

      expect(ShippingAddress.updateMany).toHaveBeenCalled();
      expect(mockAddr.name).toBe('New');
      expect(mockAddr.isDefault).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on save error', async () => {
      const mockAddr = { _id: '123', isDefault: false, save: vi.fn().mockRejectedValue(new Error('Save failed')) };
      const { req, res, next } = buildReqRes({ params: { addressId: '123' }, body: { name: 'New' } });
      ShippingAddress.findOne.mockResolvedValue(mockAddr);
      await updateShippingAddress(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('setDefaultAddress', () => {
    it('should return 404 if not found', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockResolvedValue(null);
      await setDefaultAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should set default and call updateMany to clear others', async () => {
      const mockAddr = { _id: '123', isDefault: false, save: mockSave };
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      mockSave.mockResolvedValueOnce(true);
      ShippingAddress.findOne.mockResolvedValue(mockAddr);
      ShippingAddress.updateMany.mockResolvedValue({});

      await setDefaultAddress(req, res, next);

      expect(ShippingAddress.updateMany).toHaveBeenCalledWith({ user: 'user123' }, { isDefault: false });
      expect(mockAddr.isDefault).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockRejectedValue(new Error('Error'));
      await setDefaultAddress(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deleteShippingAddress', () => {
    it('should return 404 if not found', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockResolvedValue(null);
      await deleteShippingAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 on successful deletion', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockResolvedValue({ _id: '123' });
      ShippingAddress.findByIdAndDelete.mockResolvedValue({});
      await deleteShippingAddress(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      const { req, res, next } = buildReqRes({ params: { addressId: '123' } });
      ShippingAddress.findOne.mockRejectedValue(new Error('Delete error'));
      await deleteShippingAddress(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

