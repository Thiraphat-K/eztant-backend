const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler');
const userModel = require("../models/userModel");
const recruitPostModel = require("../models/recruitPostModel");
const communityModel = require("../models/communityModel");
const scheduleModel = require('../models/scheduleModel');
const { populate } = require("../models/userModel");

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname, student_id, role, student_year, department, imgURL } = req.body

    if (!(email && password && firstname && lastname && role && department)) {
        res.status(400)
        throw new Error('Please add all fields')
    }
    if (role == 'student' && !(student_id && student_year)) {
        res.status(400)
        throw new Error('Please add student_id && student_year fields in student role')
    }
    if (role == 'teacher' && (student_id || student_year)) {
        res.status(400)
        throw new Error('Please not add student_id && student_year fields in teacher role')
    }
    // check if user exists with email
    if (await userModel.findOne({ email })) {
        throw new Error('User has already exists email')
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create user
    const user = await userModel.create({
        email, password: hashedPassword, firstname, lastname, student_id, role, student_year, department, imgURL
    })
    if (user) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            student_id: user.student_id,
            role: user.role,
            student_year: user.student_year,
            department: user.department,
            imgURL: user.imgURL,
            token: generateToken(user._id),
            createdAt: new Date(user.createdAt).toLocaleString(),
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!(email && password)) {
        res.status(400)
        throw new Error('Please add all fields')
    }
    // check for user email
    const user = await userModel.findOne({ email })
    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(201).json({
            _id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            student_id: user.student_id,
            student_year: user.student_year,
            role: user.role,
            imgURL: user.imgURL,
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid Credentials')
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { email, firstname, lastname, role, student_id, student_year } = req.body
    if (!(email && firstname && lastname && role)) {
        res.status(400)
        throw new Error('Please add all fields')
    }
    if (role === 'student' && !(student_id && student_year)) {
        res.status(400)
        throw new Error('Please add student_id && student_year fields in student role')
    }
    const updatedUser = await userModel.findByIdAndUpdate(
        req.user.id,
        req.body, {
        new: true
    })
    res.status(200).json({
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        student_id: updatedUser.student_id,
        role: updatedUser.role,
        imgURL: updatedUser.imgURL,
        student_year: updatedUser.student_year,
    })
})

const getUsers = asyncHandler(async (req, res) => {
    // const {_id , email, firstname, lastname, student_id, role, student_year } = req.body

    // if (!(_id || email || firstname || lastname || student_id || role || student_year)) {
    //     res.status(400)
    //     throw new Error('Please add least a field')
    // }
    const users = await userModel.find(req.body).select('_id email firstname lastname role department student_id student_year imgURL')
    if (!users) {
        res.status(401)
        throw Error('Users not found')
    }
    res.status(200).json(users)
})

const getMe = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id).select('_id email firstname lastname role department student_id student_year imgURL').lean()
    user['likes'] = await recruitPostModel.find({likes: user._id})
    let recruit_posts = await scheduleModel.find({requested: user._id}).distinct('recruit_post_id')
    let communities =  await scheduleModel.find({accepted: user._id}).distinct('recruit_post_id')
    const populate_config = [
        {
            path: 'owner_id',
            select: '_id firstname lastname role imgURL'
        },
        [{
            path: 'schedules',
            select: ' -__v',
            populate: [
                [{
                    path: 'requested',
                    select: '_id firstname lastname student_id student_year role imgURL'
                }],
                [{
                    path: 'accepted',
                    select: '_id firstname lastname student_id student_year role imgURL'
                }],
            ]
        }],
        [{
            path: 'comments',
            select: '-_id -updatedAt -__v',
            populate: [
                {
                    path: 'owner_id',
                    select: '_id firstname lastname role imgURL'
                },
            ]
        }],
        [{
            path: 'likes',
            select: '_id firstname lastname role imgURL'
        }],
    ]
    const populate_community_config = [
        {
            path: 'community_posts',
            select: '_id description likes comments createdAt',
            populate: [
                {
                    path: 'owner_id',
                    select: '_id email firstname lastname role'
                },
                {
                    path: 'likes',
                    select: '_id email firstname lastname role',
                },
                {
                    path: 'comments',
                    select: '-_id -updatedAt -__v',
                    populate: {
                        path: 'owner_id',
                        select: '_id email firstname lastname role'
                    }
                }
            ]
        }
    ]
    if (user.role == 'student') {
        user['requested'] = await recruitPostModel.find({_id: recruit_posts}).populate(populate_config)
        user['communities'] = await communityModel.find({recruit_post_id: communities}).populate(populate_community_config)
    }
    if (user.role == 'teacher') {
        user['recruit_posts'] = await recruitPostModel.find({_id: user._id}).populate(populate_config)
        user['communities'] = await communityModel.find({recruit_post_id: user['recruit_posts']}).populate(populate_community_config)
    }

    res.status(200).json(user)
})

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}

module.exports = {
    registerUser, updateUser, loginUser, getMe, getUsers
}