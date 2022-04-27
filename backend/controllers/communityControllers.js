const asyncHandler = require('express-async-handler')
const { aggregate_attendance_config } = require('../configuration/aggregate_config')
const { populate_community_config, populate_community_post_config, populate_attendance_config } = require('../configuration/populate_config')
const attendanceModel = require('../models/attendanceModel')
const commentModel = require('../models/commentModel')
const communityModel = require('../models/communityModel')
const communityPostModel = require('../models/communityPostModel')
const notificationModel = require('../models/notificationModel')
const receiptModel = require('../models/receiptModel')
const recruitPostModel = require('../models/recruitPostModel')
const scheduleModel = require('../models/scheduleModel')
const userModel = require('../models/userModel')
const { colorsUtils } = require('../utils/colorsUtils')

const getCommunity = asyncHandler(async (req, res) => {
    const community = await communityModel.findById(req.community._id).populate(populate_community_config).lean()
    community['receipt'] = await receiptModel.findOne({ community_id: community._id })
    community['community_posts'] = await communityPostModel.find({ community_id: req.community._id }).populate(populate_community_post_config).sort({ createdAt: -1 })
    const schedules = await scheduleModel.find({ recruit_post_id: req.community.recruit_post_id })
    const ta = []
    schedules.forEach(schedule => {
        schedule.accepted.forEach(accepted => {
            ta.push(accepted)
        });
    });
    community['student_ta'] = await userModel.find({ _id: ta }).sort({ student_id: 1 }).select('firstname lastname student_id student_year department img_url')
    res.status(201).json(community)
})

const setCommunityPost = asyncHandler(async (req, res) => {
    const user = req.user
    const community = req.community //await communityModel.findById(req.community._id)
    const community_post = await communityPostModel.create({
        owner_id: user._id,
        community_id: community._id,
        theme_color: colorsUtils[Math.floor(Math.random() * colorsUtils.length)],
        description: req.body['description'],
        file_url: req.body['file_url'],
    })
    if (!community_post) {
        res.status(401)
        // throw new Error('Invalid community post')
        throw new Error('การโพส์ไม่ถูกต้อง')
    }
    community.community_posts.push(community_post._id)
    await community.save()
    const update_community = await communityModel.findById(community._id).populate(populate_community_config)
    if (update_community) {
        res.status(201).json(update_community)
    } else {
        res.status(401)
        // throw new Error('Invalid community')
        throw new Error('คอมมูนิตี้ไม่ถูกต้อง')
    }
})

const likeCommunityPost = asyncHandler(async (req, res) => {
    const user = req.user
    const community_post = await communityPostModel.findById(req.params['post_id'])
    const likes = await communityPostModel.find({ _id: req.params['post_id'], likes: user._id })
    if (!likes.length && user._id !== community_post.owner_id) {
        community_post.likes.push(user._id)
        // create notification
        const notification = await notificationModel.create({
            receiver_id: community_post.owner_id,
            event_type: 'communityModel like',
            description: `คุณ ${user.firstname} ${user.lastname} ได้กดถูกใจโพสต์รับ TA ของคุณ วิชา ${recruit_post.subject_id} ${recruit_post.subject_name}`,
            api_link: community_post.community_id,
        })
        notification.save()
    } else {
        community_post.likes.pop(user._id)
    }
    // if (!likes.length) {
    //     community_post.likes.push(user._id)
    // } else {
    //     community_post.likes.pull(user._id)
    // }
    await community_post.save()
    const update_post = await communityPostModel.findById(req.params['post_id']).populate([
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
    ])
    if (community_post && update_post) {
        res.status(201).json(update_post)
    } else {
        res.status(401)
        // throw new Error('Invalid community_post')
        throw new Error('การโพสต์ไม่ถูกต้อง')
    }
})

const commentCommunityPost = asyncHandler(async (req, res) => {
    if (!req.params['post_id']) {
        res.status(401)
        // throw new Error('recruit_post_id not found')
        throw new Error('ไม่พบรหัสการรับสมัคร')
    }

    const user = req.user
    let community_post = await communityPostModel.findById(req.params['post_id'])

    if (!community_post) {
        res.status(401)
        // throw new Error('community_post not found')
        throw new Error('ไม่พบคอมมูนิตี้')
    }
    if (!req.body['comment']) {
        res.status(400)
        throw new Error('กรุณาใส่ความคิดเห็นในโพสต์')
    }
    const comment = await commentModel.create({
        owner_id: user._id,
        comment: req.body['comment']
    })
    if (!comment) {
        res.status(401)
        // throw new Error('comment not found')
        throw new Error('ไม่พบคอมเมนต์')
    }
    community_post.comments.push(comment._id)
    await community_post.save()
    const community = await communityModel.findById(community_post.community_id)
    const recruit_post = await recruitPostModel.findById(community.recruit_post_id)
    if (user.role !== 'teacher' && user.role == 'student') {
        // create notification
        const notification = await notificationModel.create({
            receiver_id: community_post.owner_id,
            event_type: 'communityPostModel comment',
            description: `คุณ ${user.firstname} ${user.lastname} ได้แสดงความคิดเห็นโพสต์คอมมูนิตี้ในวิชา ${recruit_post.subject_id} ${recruit_post.subject_name}`,
            api_link: community_post.community_id,
        })
        notification.save()
    }
    const update_post = await communityPostModel.findById(req.params['post_id']).populate([
        {
            path: 'owner_id',
            select: '_id email firstname lastname role'
        },
        [{
            path: 'likes',
            select: '_id firstname lastname role img_url'
        }],
        [{
            path: 'comments',
            select: '_id -__v',
            populate: [
                {
                    path: 'owner_id',
                    select: '_id firstname lastname role img_url'
                },
            ]
        }],
    ])
    if (community_post && update_post) {
        res.status(201).json(update_post)
    } else {
        res.status(400)
        // throw new Error('Invalid community_post')
        throw new Error('คอมมูนิตี้ไม่ถูกต้อง')
    }
})

const getAttendance = asyncHandler(async (req, res) => {
    const user = req.user
    const recruit_post = req.recruit_post
    let attendances
    if (user.role == 'student') {
        const schedule = await scheduleModel.findOne({ recruit_post_id: recruit_post._id, accepted: user._id })
        attendances = await attendanceModel.find({ owner_id: user._id, section: schedule.section, community_id: recruit_post.community_id, attend_date: req.body['attend_date'] }).sort({ attend_date: -1 })
        res.status(200).json(attendances)
    } else if (user.role == 'teacher' && !req.body['attend_date']) {
        attendances = await attendanceModel.find({ community_id: recruit_post.community_id }).populate(populate_attendance_config).select('-community_id -updatedAt -__v')
        let sections = []
        attendances.forEach(attendance => {
            sections.push(attendance.section)
        });
        sections = Array.from(new Set(sections))
        let results = []
        sections.forEach(section => {
            let list = []
            attendances.forEach(attendance => {
                if (section == attendance.section) {
                    list.push(attendance)
                }
            })
            results.push({
                section: section,
                attendance_by_sections: list,
            })
        });
        res.status(200).json(results)
    } else if (user.role == 'teacher' && req.body['attend_date']) {
        attendances = await attendanceModel.find({ community_id: recruit_post.community_id, attend_date: req.body['attend_date']}).populate(populate_attendance_config).select('-community_id -updatedAt -__v')
        res.status(200).json(attendances)
    }


    if (!attendances) {
        res.status(400)
        throw new Error('การเข้าสอนไม่ถูกต้อง')
    }
})

const setAttendance = asyncHandler(async (req, res) => {
    const user = req.user
    if (user.role == 'teacher' && user.role !== 'student') {
        res.status(401)
        // throw new Error('User cannot use setAttenddance because User has not student role')
        throw new Error('สำหรับนักศึกษาเท่านั้น')
    }
    const { attend_date, evidence_url } = req.body
    if (!(attend_date && evidence_url)) {
        res.status(401)
        // throw new Error('Pleas add all fields')
        throw new Error('โปรดใส่ข้อมูลให้ครบ')
    }

    const date = new Date(attend_date)
    if (!date) {
        res.status(401)
        // throw new Error('Pleas add correct attend_dates ("YYYY-MM-DD")')
        throw new Error('กรุณาใส่วันเวลาการเข้าสอนให้ถูกต้อง (YYYY-MM-DD)')
    }

    const community = req.community
    const recruit_post = req.recruit_post
    // console.log(user);
    // console.log(community);
    const schedule = await scheduleModel.findOne({ recruit_post_id: recruit_post._id, accepted: user._id })

    const attendance = await attendanceModel.create({
        owner_id: user._id,
        community_id: community._id,
        section: schedule.section,
        attend_date: date,
        evidence_url: evidence_url,
    })
    community.attendances.push(attendance._id)
    community.save()
    // create notification
    const notification = await notificationModel.create({
        receiver_id: recruit_post.owner_id,
        event_type: 'attendanceModel attendance',
        description: `คุณ ${user.firstname} ${user.lastname} ได้ส่งหลักฐานการปฏิบัติงานใน Comunity ของคุณ วิชา ${recruit_post.subject_id} ${recruit_post.subject_name} section ${schedule.section} ของวันที่ ${date.getDay()}/${date.getMonth() + 1}/${date.getFullYear()}`,
        api_link: `community._id`,
    })
    notification.save()
    if (attendance) {
        res.status(201).json(attendance)
    } else {
        res.status(401)
        // throw new Error('Invalid attendance')
        throw new Error('การเข้าสอนไม่ถูกต้อง')
    }
})

const check_by_teacher = asyncHandler(async (req, res) => {
    const user = req.user
    if (user.role !== 'teacher' && user.role == 'student') {
        res.status(401)
        // throw new Error('User cannot check because User has not teacher role')
        throw new Error('สำหรับอาจารย์ผู้สอนเท่านั้น')
    }
    const attendance = await attendanceModel.findById(req.params['attendance_id'])
    if (!attendance) {
        res.status(401)
        // throw new Error('Attendance not found')
        throw new Error('ไม่พบการเข้าสอน')
    }
    if (!attendance.check_by_teacher) {
        attendance.check_by_teacher = true
    } else {
        attendance.check_by_teacher = false
    }
    attendance.save()
    if (attendance) {
        res.status(201).json(attendance)
    } else {
        res.status(401)
        // throw new Error('Invalid attendance')
        throw new Error('การเข้าสอนไม่ถูกต้อง')
    }
})

const createReceipt = asyncHandler(async (req, res) => {
    const user = req.user
    if (user.role !== 'teacher' && user.role == 'student') {
        res.status(401)
        // throw new Error('User cannot creat receipt because user has not teacher role')
        throw new Error('สำหรับอาจารย์ผู้สอนเท่านั้น')
    }
    const recruit_post = req.recruit_post
    const community = req.community
    let attendances = await attendanceModel.find({ community_id: community._id }).sort({ section: 1, owner_id: 1, })
    let sections = await attendanceModel.find({ community_id: community._id }).distinct('section')
    let students = []
    attendances.forEach(attendance => {
        students.push(attendance.owner_id.toString())
    });

    students = Array.from(new Set(students))

    const receipt_exist = await receiptModel.findOne({ community_id: community._id })
    if (receipt_exist) {
        await receipt_exist.delete()
    }

    let receipt = await receiptModel.create({
        community_id: community._id
    })
    sections.forEach(section => {
        receipt.sections.push({
            section: section,
        })
        students.forEach(student => {
            let record_by_student = {}

            let owner_id
            let records_by_student = []
            let wages = 0
            attendances.forEach(attendance => {
                if (attendance.section == section && attendance.owner_id.toString() == student) {
                    owner_id = student
                    record_by_student = {
                        attend_date: attendance.attend_date,
                        check_by_teacher: attendance.check_by_teacher,
                    }
                    records_by_student.push(record_by_student)
                    if (attendance.check_by_teacher) {
                        wages = wages + recruit_post.wage
                    }
                }
            });
            if (records_by_student.length) {
                receipt.sections[receipt.sections.length - 1].records_by_section.push({
                    owner_id,
                    records_by_student,
                    wages: wages,
                })
            }
        });
    });
    await receipt.save()

    receipt = await receiptModel.find({ community_id: community._id })
        .populate([
            [{
                path: 'sections',
                select: '-_id',
                populate: [
                    {
                        path: 'records_by_section',
                        populate: [
                            {
                                path: 'owner_id',
                                select: '-_id firstname lastname student_id student_year role img_url'
                            }
                        ]
                    },
                ]
            }],
        ])
    res.status(201).json(receipt)

})

module.exports = {
    getCommunity, setCommunityPost, commentCommunityPost, likeCommunityPost, getAttendance, setAttendance, check_by_teacher, createReceipt
}