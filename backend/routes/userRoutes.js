const express = require('express')
const router = express.Router()
const { registerUser, updateUser, getMe, loginUser, getUsers, deleteAllUsers } = require('../controllers/userControllers')
const { protect } = require('../middleware/authenMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/update', protect, updateUser)
router.get('/getme', protect ,getMe)
router.get('/getusers', protect ,getUsers)
router.delete('/delete_all_users', deleteAllUsers)


module.exports = router