const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler');
const userModel = require("../models/userModel");
const recruitPostModel = require("../models/recruitPostModel");
const communityModel = require("../models/communityModel");
const scheduleModel = require('../models/scheduleModel');
const notificationModel = require("../models/notificationModel");
const subjectGradeModel = require("../models/subjectGradeModel");
const transcriptModel = require("../models/transcriptModel");
const { populate_recruit_post_config } = require("../configuration/populate_config");

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname, student_id, role, student_year, department, img_url } = req.body

    if (!(email && password && firstname && lastname && role && department)) {
        res.status(400)
        // throw new Error('Please add email && password && firstname && lastname && role && department fields')
        throw new Error('โปรดใส่ : อีเมลล์ รหัสผ่าน ชื่อ นามสกุล เลือกตำแหน่ง(อาจารย์ผู้สอน หรือนักศึกษา) และภาควิชา')
    }
    if (role == 'student' && !(student_id && student_year)) {
        res.status(400)
        // throw new Error('Please add student_id && student_year fields in student role')
        throw new Error('โปรดใส่ : รหัสนักศึกษา และชั้นปี')
    }
    if (role == 'teacher' && (student_id || student_year)) {
        res.status(400)
        // throw new Error('Please not add student_id && student_year fields in teacher role')
        throw new Error('ห้ามใส่ : รหัสนักศึกษา และชั้นปี')
    }
    // check if user exists with email
    if (await userModel.findOne({ email })) {
        res.status(400)
        // throw new Error('User has already exists email')
        throw new Error('อีเมลล์นี้ถูกใช้งานแล้ว')
    }

    // check if user exists with student_id
    if (role == 'student' && role !== 'teacher' && await userModel.findOne({ student_id })) {
        res.status(400)
        // throw new Error('User has already exists student_id')
        throw new Error('รหัสนักศึกษานี้ถูกใช้งานแล้ว')
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create user
    const user = await userModel.create({
        email, password: hashedPassword, firstname, lastname, student_id, role, student_year, department, img_url
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
            img_url: user.img_url,
            token: generateToken(user._id),
            createdAt: new Date(user.createdAt).toLocaleString(),
        })
    } else {
        res.status(400)
        // throw new Error('Invalid user data')
        throw new Error('ข้อมูลไม่ถูกต้อง')
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!(email && password)) {
        res.status(400)
        // throw new Error('Please add email && password fields')
        throw new Error('โปรดใส่ : อีเมลล์ และรหัสผ่าน')
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
            img_url: user.img_url,
            notifications: await notificationModel.find({ receiver_id: user._id }).sort({ createdAt: -1 }).select('_id event_type description api_link is_watched createdAt'),
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
        // throw new Error('Invalid Credentials')
        throw new Error('อีเมล์หรือรหัสผ่านไม่ถูกต้อง')
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { email, firstname, lastname, role, student_id, student_year } = req.body
    if (!(email && firstname && lastname && role)) {
        res.status(400)
        // throw new Error('Please add all fields')
        throw new Error('โปรดใส่ข้อมูลให้ครบถ้วน')
    }
    if (role === 'student' && !(student_id && student_year)) {
        res.status(400)
        // throw new Error('Please add student_id && student_year fields in student role')
        throw new Error('โปรดใส่ : รหัสนักศึกษา และชั้นปี')
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
        img_url: updatedUser.img_url,
        student_year: updatedUser.student_year,
    })
})

const updatedPassword = asyncHandler(async (req, res) => {
    if (!req.body['password'] || req.body['password'] == undefined || req.body['password'] == null || req.body['password'] == '') {
        res.status(400)
        throw new Error('กรุณาใส่รหัสผ่านเดิม')
    }
    if (!req.body['new_password'] || req.body['new_password'] == undefined || req.body['new_password'] == null || req.body['new_password'] == '') {
        res.status(400)
        throw new Error('กรุณาใส่รหัสผ่านใหม่')
    }
    let user = await userModel.findById(req.user._id)

    if (user && (await bcrypt.compare(req.body['password'], user.password))) {
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body['new_password'], salt)
        await userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword
        })
        res.status(200).json({
            message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จ'
        })
    } else {
        res.status(400)
        throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านได้ เนื่องจากรหัสผ่านเดิมไม่ถูกต้อง')
    }


})

const getUsers = asyncHandler(async (req, res) => {
    // const {_id , email, firstname, lastname, student_id, role, student_year } = req.body

    // if (!(_id || email || firstname || lastname || student_id || role || student_year)) {
    //     res.status(400)
    //     throw new Error('Please add least a field')
    // }
    if (req.body['filter'] == undefined) {
        req.body['filter'] = {}
    }
    if (req.body['sort'] == undefined) {
        req.body['sort'] = {}
    }
    if (req.body['search'] == undefined) {
        req.body['search'] = ''
    }
    if (req.body['page'] == undefined) {
        req.body['page'] = ''
    }

    let page = req.body['page']?.toString().match(/^[0-9]*$/)
    if (page[0] == '') {
        page = undefined
    } else if (page[0] < 1) {
        page = 1
    } else {
        page = parseInt(page[0])
    }
    let users = await userModel.find(req.body['filter']).select('firstname lastname department student_id').sort(req.body['sort'])
    const users_length = users.length
    users = await userModel.find(req.body['filter']).select('firstname lastname department student_id').sort(req.body['sort']).skip((page - 1) * 10).limit(10)
    if (!users) {
        res.status(400)
        // throw Error('Users not found')
        throw Error('ไม่พบผู้ใช้งาน')
    }
    let search = []
    if (req.body['search'] !== '') {
        users.forEach(user => {
            if (JSON.stringify(Object.values(user)).toLowerCase().replace(/[^a-zA-Z0-9ก-๏]/g, '').includes(req.body['search'].toLowerCase())) {
                search.push(user)
            }
        });
    } else {
        search = users
    }

    // users.push({
    //     total: Math.ceil(users_length / 10)
    // })
    res.status(200).json({
        users: search,
        total: Math.ceil(users_length / 10)
    })
})

const getMe = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id).select('_id email firstname lastname role department student_id student_year imgURL').lean()
    user['likes'] = await recruitPostModel.find({ likes: user._id })//.populate(populate_recruit_post_config)
    let recruit_posts = await scheduleModel.find({ requested: user._id }).distinct('recruit_post_id')
    let communities = await scheduleModel.find({ accepted: user._id }).distinct('recruit_post_id')

    if (user.role == 'student') {
        user['requested'] = await recruitPostModel.find({ _id: recruit_posts }).populate(populate_recruit_post_config)
        user['communities'] = await communityModel.find({ recruit_post_id: communities }).populate('recruit_post_id')//.select('-attendances')//.populate(populate_community_config)
        user['transcript'] = await transcriptModel.findOne({ owner_id: user._id })
    }
    if (user.role == 'teacher') {
        user['recruit_posts'] = await recruitPostModel.find({ owner_id: user._id }).populate(populate_recruit_post_config)
        user['communities'] = await communityModel.find({ recruit_post_id: user['recruit_posts'] })//.populate('recruit_post_id')//.select('-attendances')//.populate(populate_community_config)
            .select('-community_posts -attendances')
            .populate([
                {
                    path: 'recruit_post_id',
                    select: 'subject_name subject_id isOpened createdAt'
                },
            ])
    }
    user['notifications'] = await notificationModel.find({ receiver_id: req.user.id }).sort({ createdAt: -1 }).select('_id event_type description api_link is_watched createdAt')
    res.status(200).json(user)
})

const getLikesMe = asyncHandler(async (req, res) => {
    const user = req.user
    if (req.body['likes'] == undefined || !req.body['likes'].length) {
        res.status(400)
        throw new Error('กรุณาระบุ _id ของไลก์ในรูป Array')
    }
    const likes = await recruitPostModel.find({ likes: user._id }).populate(populate_recruit_post_config)
    res.status(200).json(likes)
})

const createTranscript = asyncHandler(async (req, res) => {
    const user = req.user
    let transcript_user = await transcriptModel.find({ owner_id: user._id })
    if (transcript_user.length > 0) {
        await transcriptModel.deleteMany({ owner_id: user._id })
    }
    let subject_user = await subjectGradeModel.find({ owner_id: user._id })
    if (subject_user.length > 0) {
        await subjectGradeModel.deleteMany({ owner_id: user._id })
    }
    const transcript_pdf = req.extract_pdf

    let uniques = [...new Set(transcript_pdf.subject.map(propYoureChecking => propYoureChecking.title))];
    let allowed
    let semesters = []
    allowed = ['ปี 1 เทอม 1', 'ปี 1 เทอม 2',
        'ปี 2 เทอม 1', 'ปี 2 เทอม 2',
        'ปี 3 เทอม 1', 'ปี 3 เทอม 2',
        'ปี 4 เทอม 1', 'ปี 4 เทอม 2']
    let filtered = transcript_pdf.subject.filter(function (item) {
        return allowed.indexOf(item.title) > -1;
    });
    let subjects = []
    filtered.forEach(subject => {
        subjects.push({
            owner_id: user._id.toString(),
            subject_id: subject.id,
            subject_name: subject.name,
            subject_grade: subject.grade
        })
    });
    subjects = await subjectGradeModel.insertMany(subjects)
    subjects.forEach(subject => {
        subject.save()
    });

    uniques.forEach(title => {
        allowed = [title]
        filtered = transcript_pdf.subject.filter(function (item) {
            return allowed.indexOf(item.title) > -1;
        });
        subjects = []
        filtered.forEach(course => {
            subjects.push({
                subject_id: course.id,
                subject_name: course.name,
                subject_grade: course.grade,
            })
        });
        let semester = {
            title: title,
            subjects: subjects
        }
        semesters.push(semester)
    });
    let transcript = {
        owner_id: user._id.toString(),
        firstname: transcript_pdf.firstname,
        lastname: transcript_pdf.lastname,
        semesters: semesters,
    }
    transcript_user = await transcriptModel.create(transcript)
    await transcript_user.save()
    res.status(200).json({
        // 'message': 'Successfully',
        message: 'สำเร็จ',
        transcript: transcript
    })
})

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}

module.exports = {
    registerUser, updateUser, loginUser, getMe, getUsers, createTranscript, updatedPassword, getLikesMe
}