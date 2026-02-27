import { describe, expect, it, beforeEach, vi } from 'vitest'
import { getNotifications, getNotificationById, createNotification, updateNotification, deleteNotification } from '../notificationController.js'

// Mocks
vi.mock('../../models/notification.js', () => {
  const m = {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  }
  return { default: m }
})

import Notification from '../../models/notification.js'

function buildReqRes() {
  const req = { params: {}, body: {} }
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }
  const next = vi.fn()
  return { req, res, next }
}

describe('Notification Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('should return list of notifications', async () => {
      const { req, res, next } = buildReqRes()
      Notification.find.mockResolvedValue([
        { _id: 'n1', message: 'Hello' },
        { _id: 'n2', message: 'World' },
      ])

      await getNotifications(req, res, next)

      expect(Notification.find).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ _id: 'n1' }),
        expect.objectContaining({ _id: 'n2' }),
      ])
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('getNotificationById', () => {
    it('should return a notification when found', async () => {
      const { req, res, next } = buildReqRes()
      req.params.id = 'n1'
      Notification.findById.mockResolvedValue({ _id: 'n1', message: 'Test' })

      await getNotificationById(req, res, next)

      expect(Notification.findById).toHaveBeenCalledWith('n1')
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'n1' }))
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 404 when not found', async () => {
      const { req, res, next } = buildReqRes()
      req.params.id = 'missing'
      Notification.findById.mockResolvedValue(null)

      await getNotificationById(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const { req, res, next } = buildReqRes()
      req.body = { user: 'u1', message: 'New' }
      const mockCreated = {
        _id: 'n3',
        user: 'u1',
        message: 'New',
        isRead: false,
        populate: vi.fn().mockResolvedValueThis(),
      }
      Notification.create.mockResolvedValue(mockCreated)

      await createNotification(req, res, next)

      expect(Notification.create).toHaveBeenCalledWith({ user: 'u1', message: 'New', isRead: false })
      expect(mockCreated.populate).toHaveBeenCalledWith('user')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockCreated)
    })
  })

  describe('updateNotification', () => {
    it('should update and return the notification', async () => {
      const { req, res, next } = buildReqRes()
      req.params.id = 'n1'
      req.body = { message: 'Updated', isRead: true }
      const updated = { _id: 'n1', message: 'Updated', isRead: true, populate: vi.fn().mockResolvedValueThis() }
      Notification.findByIdAndUpdate.mockResolvedValue(updated)

      await updateNotification(req, res, next)

      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith('n1', { message: 'Updated', isRead: true }, { new: true })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updated)
    })

    it('should return 404 when not found', async () => {
      const { req, res, next } = buildReqRes()
      req.params.id = 'n2'
      req.body = { message: 'X' }
      Notification.findByIdAndUpdate.mockResolvedValue(null)

      await updateNotification(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' })
    })
  })

  describe('deleteNotification', () => {
    it('should delete and return 204', async () => {
      const { req, res, next } = buildReqRes()
      req.params.id = 'n1'
      Notification.findByIdAndDelete.mockResolvedValue({ _id: 'n1' })

      await deleteNotification(req, res, next)

      expect(Notification.findByIdAndDelete).toHaveBeenCalledWith('n1')
      expect(res.status).toHaveBeenCalledWith(204)
    })

    it('should return 404 when not found', async () => {
      const { req, res, next } = buildReqRes()
      req.params.id = 'n3'
      Notification.findByIdAndDelete.mockResolvedValue(null)

      await deleteNotification(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' })
    })
  })
})
