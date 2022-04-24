const express = require('express')
const { getCommunity, setCommunityPost, commentCommunityPost, likeCommunityPost, setAttendance, getAttendance, check_by_teacher, createReceipt } = require('../controllers/communityControllers')
const { protect } = require('../middleware/authenMiddleware')
const { accessible_community } = require('../middleware/communityMiddleware')
const router = express.Router()

router.get('/:community_id', protect, accessible_community, getCommunity)
router.post('/:community_id/post/create', protect, accessible_community, setCommunityPost)
router.post('/:community_id/post/:post_id/comment', protect, accessible_community, commentCommunityPost)
router.post('/:community_id/post/:post_id/like', protect, accessible_community, likeCommunityPost)
router.get('/:community_id/attendance/get', protect, accessible_community, getAttendance)
router.post('/:community_id/attendance/create', protect, accessible_community, setAttendance)
router.post('/:community_id/attendance/:attendance_id/check_by_teacher', protect, accessible_community, check_by_teacher)
router.post('/:community_id/receipt/create', protect, accessible_community, createReceipt)


module.exports = router