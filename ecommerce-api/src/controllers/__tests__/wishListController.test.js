import { describe, it, expect, beforeEach, vi } from 'vitest'

// WishList controller unit tests (expanded)
import { getUserWishList, addToWishList, removeFromWishList, clearWishList } from '../wishListController.js'

const { mockWishList } = vi.hoisted(() => {
  const mockWishList = vi.fn(function (data) {
    Object.assign(this, data)
    this.save = vi.fn().mockResolvedValue(this)
  })
  mockWishList.findOne = vi.fn()
  mockWishList.create = vi.fn()
  mockWishList.findByIdAndUpdate = vi.fn()
  mockWishList.findOneAndUpdate = vi.fn()
  return { mockWishList }
})

vi.mock("../../models/wishList.js", () => ({ default: mockWishList }))

function makeReqRes(overrides = {}) {
  const req = { user: { userId: 'u1' }, query: {}, params: {}, body: {}, ...overrides }
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() }
  const next = vi.fn()
  return { req, res, next }
}

describe('WishListController', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getUserWishList', () => {
    it('should return user wishlist when exists', async () => {
      const { req, res, next } = makeReqRes()
      const wishlist = { user: 'u1', items: ['p1', 'p2'] }
      mockWishList.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(wishlist) })

      await getUserWishList(req, res, next)

      expect(mockWishList.findOne).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalled()
    })
  })

  describe('addToWishList', () => {
    it('should create wishlist when not existing', async () => {
      const { req, res, next } = makeReqRes({ body: { productId: 'p1' } })
      mockWishList.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) })
      mockWishList.create.mockResolvedValue({ _id: 'w1', user: 'u1', products: ['p1'] })

      await addToWishList(req, res, next)

      expect(mockWishList.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
    })
  })

  test('exports sanity: removeFromWishList is a function', () => {
    expect(typeof removeFromWishList).toBe('function')
  })
  test('exports sanity: clearWishList is a function', () => {
    expect(typeof clearWishList).toBe('function')
  })
})
