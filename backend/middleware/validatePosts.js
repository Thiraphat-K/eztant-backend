const asyncHandler = require('express-async-handler')
const recruitPostModel = require('../models/recruitPostModel')
const scheduleModel = require('../models/scheduleModel')

const validate_requested_post = asyncHandler(async (req, res, next) => {
    const user = req.user
    // check role user
    if (user.role == 'teacher' && user.role !== 'student') {
        res.status(400)
        throw new Error('สำหรับนักศึกษาเท่านั้น')
    }
    if (!req.params['_id']) {
        res.status(401)
        throw new Error('schedule_id not found')
    }
    const schedule = await scheduleModel.findById(req.params['_id'])

    let requested_schedule_time = {
        day: schedule.day,
        time_from: schedule.time_from.split(':')[0] * 60 + schedule.time_from.split(':')[1] * 1,
        time_to: schedule.time_to.split(':')[0] * 60 + schedule.time_from.split(':')[1] * 1,
    }
    const recruit_post = await recruitPostModel.findById(schedule.recruit_post_id)
    const accepted_requested = await scheduleModel.findOne({ recruit_post_id: recruit_post._id, accepted: user._id })
    if (accepted_requested) {
        res.status(400)
        throw new Error('ไม่สามารถยกเลิกการสมัครได้ เนื่องจากอาจารย์ผู้สอนตอบรับการสมัครแล้ว')
    }
    // const recruit_post = await recruitPostModel.findById(schedule.recruit_post_id)
    const accepted_schedules = await scheduleModel.find({ accepted: user._id })
    // console.log(accepted_schedules);
    accepted_schedules.forEach(accepted => {
        let accepted_schedule_time = {
            day: accepted.day,
            time_from: accepted.time_from.split(':')[0] * 60 + accepted.time_from.split(':')[1] * 1,
            time_to: accepted.time_to.split(':')[0] * 60 + accepted.time_from.split(':')[1] * 1,
        }
        if (requested_schedule_time.day == accepted_schedule_time.day) {
            if (requested_schedule_time.time_to > accepted_schedule_time.time_to) {
                before = accepted_schedule_time
                after = requested_schedule_time
            } else {
                before = requested_schedule_time
                after = accepted_schedule_time
            }
            if (before.time_to > after.time_from) {
                res.status(400)
                throw new Error(`ไม่สามารถส่งคำขอการเป็น TA วิชานี้ได้ เนื่องจากทับซ้อนตารางเวลาการปฏิงาน TA`)
            }
        }
    });

    // const accepted_recruit_post = await recruitPostModel.find({ _id: accepted_schedules })

    next()
})

const validate_accepted_post = asyncHandler(async (req, res, next) => {
    const user = req.user
    // check role user
    if (user.role == 'student' && user.role !== 'teacher') {
        res.status(400)
        throw new Error('สำหรับอาจารย์เท่านั้นเท่านั้น')
    }
    if (!req.params['schedule_id']) {
        res.status(401)
        throw new Error('schedule_id not found')
    }
    const schedule = await scheduleModel.findById(req.params['schedule_id'])
    let requested_schedule_time = {
        day: schedule.day,
        time_from: schedule.time_from.split(':')[0] * 60 + schedule.time_from.split(':')[1] * 1,
        time_to: schedule.time_to.split(':')[0] * 60 + schedule.time_from.split(':')[1] * 1,
    }
    // const recruit_post = await recruitPostModel.findById(schedule.recruit_post_id)
    // const accepted_requested = await scheduleModel.findOne({ recruit_post_id: recruit_post._id, accepted: req.params['user_id'] })
    // if (accepted_requested) {
    //     res.status(400)
    //     throw new Error('ไม่สามารถยกเลิกการสมัครได้ เนื่องจากอาจารย์ผู้สอนตอบรับการสมัครแล้ว')
    // }
    const accepted_schedules = await scheduleModel.find({ accepted: req.params['user_id'] })
    accepted_schedules.forEach(accepted => {
        let accepted_schedule_time = {
            day: accepted.day,
            time_from: accepted.time_from.split(':')[0] * 60 + accepted.time_from.split(':')[1] * 1,
            time_to: accepted.time_to.split(':')[0] * 60 + accepted.time_from.split(':')[1] * 1,
        }
        if (requested_schedule_time.day == accepted_schedule_time.day) {
            if (requested_schedule_time.time_to > accepted_schedule_time.time_to) {
                before = accepted_schedule_time
                after = requested_schedule_time
            } else {
                before = requested_schedule_time
                after = accepted_schedule_time
            }
            if (before.time_to > after.time_from) {
                // const post = await recruitPostModel.findById(accepted.recruit_post_id)
                res.status(400)
                throw new Error(`ไม่สามารถยืนยันคำขอการเป็น TA วิชานี้ได้ เนื่องจากทับซ้อนตารางเวลาการปฏิงาน TA ของวิชาอื่น`)
            }
        }
    });

    next()
})

module.exports = {
    validate_requested_post, validate_accepted_post
}