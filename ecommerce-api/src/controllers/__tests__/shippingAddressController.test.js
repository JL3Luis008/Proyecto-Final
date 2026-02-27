import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  createShippingAddress,
  getUserAddresses,
  getAddressById,
  getDefaultAddress,
  updateShippingAddress,
  setDefaultAddress,
  deleteShippingAddress,
} from '../shippingAddressController.js'

// Mock ShippingAddress model
const { mockShippingAddress } = vi.hoisted(() => {
  const mockShippingAddress = vi.fn(function (data) {
    Object.assign(this, data)
    this.save = vi.fn().mockResolvedValue(this)
  })
  mockShippingAddress.find = vi.fn()
  mockShippingAddress.findById = vi.fn()
  mockShippingAddress.findOne = vi.fn()
  mockShippingAddress.findByIdAndDelete = vi.fn()
  mockShippingAddress.updateMany = vi.fn()
  mockShippingAddress.prototype.save = vi.fn()
  return { mockShippingAddress }
})

vi.mock('../../models/shippingAddress.js', () => ({ default: mockShippingAddress }))

import ShippingAddress from '../../models/shippingAddress.js'

function buildReqRes(overrides = {}) {
  const req = {
    user: { userId: 'user123' },
    params: {},
    body: {},
    ...overrides,
  }
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
  const next = vi.fn()
  return { req, res, next }
}

describe('ShippingAddressController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createShippingAddress', () => {
    it('should create address and return 201 (with default country)', async () => {
      const { req, res, next } = buildReqRes({ body: {
        name: 'Home', address: '123 Street', city: 'City', state: 'State', postalCode: '12345', phone: '1234567890', isDefault: true
      }})

      // Mock: updateMany is used to unset previous defaults
      ShippingAddress.updateMany = vi.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 })

      await createShippingAddress(req, res, next)

      expect(ShippingAddress.updateMany).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalled()
    })
  })

  describe('getUserAddresses', () => {
    it('should return user addresses', async () => {
      const { req, res, next } = buildReqRes()
      const addresses = [{ _id: 'addr1' }, { _id: 'addr2' }]
      ShippingAddress.find.mockReturnValue({ sort: vi.fn().mockResolvedValue(addresses) })

      await getUserAddresses(req, res, next)

      expect(ShippingAddress.find).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ message: 'Addresses retrieved successfully', count: addresses.length, addresses })
    })
  })
  it('SA-10 BD falla → next(error) en getUserAddresses', async () => {
    const { req, res, next } = buildReqRes();
    ShippingAddress.find.mockRejectedValue(new Error('DB down'));
    await getUserAddresses(req, res, next);
    expect(next).toHaveBeenCalled();
  });
})
