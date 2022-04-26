const asyncHandler = require('express-async-handler')
const notificationModel = require('../models/notificationModel')
const userModel = require('../models/userModel')

const getNotification = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401)
        // throw new Error('User not found')
        throw new Error('ไม่พบบัญชีผู้ใช้งาน')
    }
    const user = await userModel.findById(req.user.id)
    if (!user) {
        res.status(401)
        // throw new Error('User not found')
        throw new Error('ไม่พบบัญชีผู้ใช้งาน')
    }
    const notifications = await notificationModel.find({ receiver_id: user._id }).select('-_id event_type description api_link is_watched createdAt').sort({createdAt: -1})
    let update_notifications = await notificationModel.find({ receiver_id: user._id , is_watched: false})
    update_notifications.forEach(notification => {
        notification.is_watched = true
        notification.save()
    });

    update_notifications = await notificationModel.find({ receiver_id: user._id}).sort({createdAt: -1})
    for (let i = 20; i < update_notifications.length; i++) {
        await update_notifications[i].delete()
    }
    
    if (notifications) {
        res.status(201).json(notifications)
    } else {
        res.status(400)
        // throw new Error('Invalid notification')
        throw new Error('การแจ้งเตือนไม่ถูกต้อง')
    }
    
})

module.exports = {
    getNotification,
}