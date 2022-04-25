const express = require('express')
const router = express.Router()
const { registerUser, updateUser, getMe, loginUser, getUsers, createTranscript } = require('../controllers/userControllers')
const { protect } = require('../middleware/authenMiddleware')
const { validateTranscript } = require('../utils/validateTranscript')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/update', protect, updateUser)
router.get('/getme', protect ,getMe)
router.post('/getusers', protect ,getUsers)
router.post('/transcript', protect, validateTranscript, createTranscript)


module.exports = router