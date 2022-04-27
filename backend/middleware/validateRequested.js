const asyncHandler = require('express-async-handler')
const recruitPostModel = require('../models/recruitPostModel')
const scheduleModel = require('../models/scheduleModel')

const validate_requested = asyncHandler(async (req, res, next) => {
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
    console.log({
        day:schedule.day,
        time_from: schedule.time_from.split(':')[0] * 60 + schedule.time_from.split(':')[1] * 1,
        time_to: schedule.time_to.split(':')[0] * 60 + schedule.time_from.split(':')[1] * 1,
    });
    // const recruit_post = await recruitPostModel.findById(schedule.recruit_post_id)
    const accepted_schedules = await scheduleModel.find({ accepted: user._id })
    accepted_schedules.forEach(accepted => {
        console.log({
            day:schedule.day,
            time_from: accepted.time_from.split(':')[0] * 60 + accepted.time_from.split(':')[1] * 1,
            time_to: accepted.time_to.split(':')[0] * 60 + accepted.time_from.split(':')[1] * 1,
        });
    });
    // const accepted_recruit_post = await recruitPostModel.find({ _id: accepted_schedules })
    console.log(schedule);
    console.log(accepted_schedules);
    next()
})

module.exports = {
    validate_requested
}