const express = require("express");
const router = express.Router()
const { setRecruitPost, likeRecruitPost, requestedRecruitPost, acceptedRecruitPost, commentRecruitPost, getRecruitPosts, getRecruitPost, recommendRecruitPost, deleteRecruitPost } = require("../controllers/recruitPostControllers");
const { protect } = require("../middleware/authenMiddleware");
const { validate_requested } = require("../middleware/validateRequested");

router.post('/getposts', protect, getRecruitPosts)
router.get('/recommends', protect, recommendRecruitPost)
router.post('/create', protect, setRecruitPost)
router.get('/:_id', protect, getRecruitPost)
router.delete('/:_id/delete', protect, deleteRecruitPost)
router.post('/:_id/like', protect, likeRecruitPost)
router.post('/:_id/comment', protect, commentRecruitPost)
router.post('/schedule/:_id/request', protect, validate_requested, requestedRecruitPost)
router.post('/schedule/:schedule_id/accept/:user_id', protect, acceptedRecruitPost)

module.exports = router