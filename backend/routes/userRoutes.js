const express = require('express')
const router = express.Router()
const { registerUser, updateUser, getMe, loginUser, getUsers, createTranscript, updatedPassword, getLikesMe } = require('../controllers/userControllers')
const { protect } = require('../middleware/authenMiddleware')
const { exportPDF } = require('../middleware/transcriptMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/update', protect, updateUser)
router.put('/update_password', protect, updatedPassword)
router.get('/getme', protect, getMe)
router.get('/getme/likes', protect, getLikesMe)
router.post('/getusers', protect, getUsers)
router.post('/transcript', protect, exportPDF, createTranscript)


module.exports = router