const asyncHandler = require('express-async-handler');
const attendanceModel = require('../models/attendanceModel');
const commentModel = require('../models/commentModel');
const communityModel = require('../models/communityModel');
const notificationModel = require('../models/notificationModel');
const receiptModel = require('../models/receiptModel');
const recruitPostModel = require('../models/recruitPostModel');
const scheduleModel = require('../models/scheduleModel');
const userModel = require("../models/userModel")

const deleteAllUsers = asyncHandler(async (req, res) => {
    await userModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted users'
        message: 'บัญชีผู้ใช้งานถูกลบแล้ว'
    })
})

const deleteSchedules = asyncHandler(async (req, res) => {
    await scheduleModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted schedules'
        message: 'ตารางสอนถูกลบแล้ว'
    })
})

const deleteAttendances = asyncHandler(async (req, res) => {
    await attendanceModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted attendances'
        message: 'การเข้าสอนถูกลบแล้ว'
    })
})

const deleteComments = asyncHandler(async (req, res) => {
    await commentModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted comments'
        message: 'คอมเมนต์ถูกลบแล้ว'
    })
})

const deleteCommunities = asyncHandler(async (req, res) => {
    await communityModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted communities'
        message: 'คอมมูนิตี้ถูกลบแล้ว'
    })
})

const deleteNotifications = asyncHandler(async (req, res) => {
    await notificationModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted notifications'
        message: 'การแจ้งเตือนถูกลบแล้ว'
    })
})

const deleteReceipts = asyncHandler(async (req, res) => {
    await receiptModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted receipts'
        message: 'ข้อมูลการเงินถูกลบแล้ว'
    })
})

const deleteRecruitPosts = asyncHandler(async (req, res) => {
    await recruitPostModel.deleteMany({})
    res.status(200).json({
        // message: 'Successfully deleted recruit posts'
        message: 'การรับสมัครถูกลบแล้ว'
    })
})

module.exports = {
    deleteAllUsers, deleteAttendances, deleteComments, deleteCommunities, deleteNotifications, deleteReceipts, deleteRecruitPosts, deleteSchedules
}