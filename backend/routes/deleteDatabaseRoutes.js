const express = require('express')
const { deleteAllUsers, deleteSchedules, deleteAttendances, deleteComments, deleteCommunities, deleteNotifications, deleteReceipts, deleteRecruitPosts } = require('../controllers/deleteDatabaseControllers')
const router = express.Router()

router.delete('/user', deleteAllUsers)
router.delete('/schedule', deleteSchedules)
router.delete('/attendance', deleteAttendances)
router.delete('/comment', deleteComments)
router.delete('/community', deleteCommunities)
router.delete('/notificaion', deleteNotifications)
router.delete('/receipt', deleteReceipts)
router.delete('/recruit_post', deleteRecruitPosts)

module.exports = router
