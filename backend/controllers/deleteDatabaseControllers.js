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
        message: 'Successfully deleted users'
    })
})

const deleteSchedules = asyncHandler(async (req, res) => {
    await scheduleModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted schedules'
    })
})

const deleteAttendances = asyncHandler(async (req, res) => {
    await attendanceModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted attendances'
    })
})

const deleteComments = asyncHandler(async (req, res) => {
    await commentModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted comments'
    })
})

const deleteCommunities = asyncHandler(async (req, res) => {
    await communityModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted communities'
    })
})

const deleteNotifications = asyncHandler(async (req, res) => {
    await notificationModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted notifications'
    })
})

const deleteReceipts = asyncHandler(async (req, res) => {
    await receiptModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted receipts'
    })
})

const deleteRecruitPosts = asyncHandler(async (req, res) => {
    await recruitPostModel.deleteMany({})
    res.status(200).json({
        message: 'Successfully deleted recruit posts'
    })
})

module.exports = {
    deleteAllUsers, deleteAttendances, deleteComments, deleteCommunities, deleteNotifications, deleteReceipts, deleteRecruitPosts, deleteSchedules
}