const express = require("express");
const router = express.Router()
const { setRecruitPost, getRecruitPost, likeRecruitPost, requestedRecruitPost, acceptedRecruitPost, commentRecruitPost } = require("../controllers/recruitPostControllers");
const { protect } = require("../middleware/authenMiddleware");

router.get('/getposts', protect, getRecruitPost)
router.post('/create', protect, setRecruitPost)
router.post('/:_id/like', protect, likeRecruitPost)
router.post('/:_id/comment', protect, commentRecruitPost)
router.post('/schedule/:_id/request', protect, requestedRecruitPost)
router.post('/schedule/:schedule_id/accept/:user_id', protect, acceptedRecruitPost)

module.exports = router