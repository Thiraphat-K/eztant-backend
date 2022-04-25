const asyncHandler = require('express-async-handler')
const { type } = require('express/lib/response')
const { aggregate_config } = require('../configuration/aggregate_config')
const { day } = require('../configuration/day_config')
const { populate_recruit_post_config } = require('../configuration/populate_config')
const commentModel = require('../models/commentModel')
const communityModel = require('../models/communityModel')
const notificationModel = require('../models/notificationModel')
const recruitPostModel = require('../models/recruitPostModel')
const scheduleModel = require('../models/scheduleModel')
const userModel = require('../models/userModel')
const getRecruitPost = asyncHandler(async (req, res) => {
    const recruit_post = await recruitPostModel.findById(req.params['_id']).populate(populate_recruit_post_config)
    // check expired date
    if (recruit_post.expired && new Date().getTime() > recruit_post.expired.getTime()) {
        recruit_post.isOpened = false
        recruit_post.save()
    }
    if (!recruit_post) {
        res.status(401)
        throw Error('Recruit post not found')
    }
    res.status(200).json(recruit_post)
})

// 'owner_id schedules comments likes'
const getRecruitPosts = asyncHandler(async (req, res) => {
    let recruit_posts = await recruitPostModel.find({}).populate(populate_recruit_post_config)

    // check expired date
    recruit_posts.forEach(recruit_post => {
        if (recruit_post.expired && new Date().getTime() > recruit_post.expired.getTime()) {
            recruit_post.isOpened = false
            recruit_post.save()
        }
    });

    if (req.body['page'] == undefined) {
        req.body['page'] = 1
    }
    let page = req.body['page'].toString().match(/^[0-9]*$/)
    if (page == null || page[0] < 1) {
        page = 1
    } else {
        page = parseInt(page[0])
    }
    let recruit_posts_length
    if (req.body['sort']['likes'] !== undefined) {
        aggregate_config.push({ '$sort': { 'likes_length': req.body['sort']['likes'] } })
        recruit_posts = await recruitPostModel.aggregate(aggregate_config)
        recruit_posts_length = recruit_posts.length
        recruit_posts = await recruitPostModel.aggregate(aggregate_config).skip((page-1)*10).limit(10)

    } else if (req.body['sort']['owner_id'] !== undefined) {
        aggregate_config.push({ '$sort': req.body['sort']['owner_id'] })
        recruit_posts = await recruitPostModel.aggregate(aggregate_config)
        recruit_posts_length = recruit_posts.length
        recruit_posts = await recruitPostModel.aggregate(aggregate_config).skip((page-1)*10).limit(10)

    } else {
        recruit_posts = await recruitPostModel.aggregate(aggregate_config)
        recruit_posts_length = recruit_posts.length
        recruit_posts = await recruitPostModel.find(req.body['filter']).populate(populate_recruit_post_config).sort(req.body['sort']).skip((page-1)*10).limit(10)
    }
    // recruit_posts = await recruitPostModel.find(req.body['filter']).populate(populate_recruit_post_config)//.sort(req.body['sort'])


    // let posts = recruitPostModel.aggregate([{ $group: { 'owner_id': -1 } }])
    // posts.forEach(post => {
    //     console.log(post);
    // });

    if (!recruit_posts) {
        res.status(401)
        throw Error('Recruit post not found')
    }
    recruit_posts.push(
        {
            total: Math.ceil(recruit_posts_length/10)
        }
    )
    res.status(200).json(recruit_posts)
})

const setRecruitPost = asyncHandler(async (req, res) => {
    const { subject_name, subject_id, wage, requirement_grade, requirement_year, description, duty, schedules, expired } = req.body
    const user = req.user
    if (user && user.role == 'student') {
        res.status(401)
        throw new Error('User role is not allowed')
    }
    if (!(subject_name && subject_id && wage && requirement_grade && requirement_year && expired)) {
        res.status(400)
        throw new Error('Please add subject_name && subject_id && wage && requirement_grade && requirement_year && expired fields')
    }
    if (isNaN(subject_id) || typeof subject_id !== 'string' || subject_id.length !== 8) {
        res.status(400)
        throw new Error('Please add subject_id field with 8 digit number in string type')
    }
    if (parseInt(subject_id) < 0 || parseInt(subject_id) > 99999999) {
        res.status(400)
        throw new Error('Please add subject_id field in range 00000000 - 99999999')
    }
    const recruit_post = await recruitPostModel.create({
        owner_id: req.user.id,
        subject_name, subject_id, wage, requirement_grade, requirement_year, description, duty, expired
    })
    let sections = new Set()
    let schedule_times = []
    schedules.forEach(schedule => {
        sections.add(schedule.section)
        if (!day[schedule.day]) {
            res.status(400)
            throw new Error('Please add a day field in correct value \" sunday monday tuesday wednesday thursday friday saturday \"')
        }

        let time_from = schedule.time_from.split(':')
        if (time_from[0].length !== 2 || time_from[1].length !== 2 || isNaN(time_from[0]) || isNaN(time_from[1])) {
            res.status(400)
            throw new Error('Please add time_from field in schedule with HH:MM')
        }
        time_from[0] = parseInt(time_from[0])
        time_from[1] = parseInt(time_from[1])
        if (time_from[1] < 0 || 59 < time_from[1]) {
            res.status(400)
            throw new Error('Please add time_from field in schedule with 00<=MM<=59')
        }
        if (time_from[0] < 0 || 23 < time_from[0]) {
            res.status(400)
            throw new Error('Please add time_from field in schedule with 00<=HH<=23')
        }

        let time_to = schedule.time_to.split(':')
        if (time_to[0].length !== 2 || time_to[1].length !== 2 || isNaN(time_to[0]) || isNaN(time_to[1])) {
            res.status(400)
            throw new Error('Please add time_to field in schedule with HH:MM')
        }
        time_to[0] = parseInt(time_to[0])
        time_to[1] = parseInt(time_to[1])

        if (time_to[1] < 0 || 59 < time_to[1]) {
            res.status(400)
            throw new Error('Please add time_to field in schedule with 00<=MM<=59')
        }
        if (time_to[0] < 0 || 23 < time_to[0]) {
            res.status(400)
            throw new Error('Please add time_to field in schedule with 00<=HH<=23')
        }
        if (time_from[0] * 60 + time_from[1] >= time_to[0] * 60 + time_to[1]) {
            res.status(400)
            throw new Error('Please add time_from before time_to')
        }
        schedule_times.push({
            day: day[schedule.day],
            time_from: time_from[0] * 60 + time_from[1],
            time_to: time_to[0] * 60 + time_to[1]
        })
    });
    if (sections.size < schedules.length) {
        res.status(400)
        throw new Error('Please add section field in schedules without duplicate')
    }
    for (let i = 0; i < schedule_times.length; i++) {
        for (let j = i + 1; j < schedule_times.length; j++) {
            if (schedule_times[i].day == schedule_times[j].day) {
                let before, after
                if (schedule_times[i].time_from == schedule_times[j].time_from || schedule_times[i].time_to == schedule_times[j].time_to) {
                    res.status(400)
                    throw new Error('Please add time_from and time to field in schedules without intersect interval time in same day')
                }
                if (schedule_times[i].time_from < schedule_times[j].time_from) {
                    before = schedule_times[i]
                    after = schedule_times[j]
                } else {
                    before = schedule_times[j]
                    after = schedule_times[i]
                }
                if (before.time_to > after.time_from) {
                    res.status(400)
                    throw new Error('Please add time_from and time to field in schedules without intersect interval time in same day')
                }
            }
        }
    }
    const schedules_model = await scheduleModel.insertMany(schedules)
    schedules_model.forEach(schedule => {
        schedule.recruit_post_id = recruit_post._id
        recruit_post.schedules.push(schedule)
        schedule.save()
    });
    const community = await communityModel.create({
        recruit_post_id: recruit_post._id
    })
    recruit_post.community_id = community._id
    await recruit_post.save()
    await community.save()
    const post = await recruitPostModel.findById(recruit_post._id).populate(populate_recruit_post_config)

    if (recruit_post && community && post) {
        res.status(201).json(post)
    } else {
        res.status(400)
        throw new Error('Invalid recruit post')
    }
})

const likeRecruitPost = asyncHandler(async (req, res) => {
    const user = req.user
    if (!req.params['_id']) {
        res.status(401)
        throw new Error('recruit_post_id not found')
    }
    const recruit_post = await recruitPostModel.findById(req.params['_id'])
    if (!recruit_post) {
        res.status(401)
        throw new Error('recruit_post not found')
    }

    // check like toggle
    const likes = await recruitPostModel.find({ _id: req.params['_id'], likes: user._id })
    if (!likes.length) {
        recruit_post.likes.push(user._id)
        // create notification
        const notification = await notificationModel.create({
            receiver_id: recruit_post.owner_id,
            event_type: 'recruitPostModel like',
            description: `คุณ ${user.firstname} ${user.lastname} ได้กดถูกใจโพสต์รับ TA ของคุณ วิชา ${recruit_post.subject_id} ${recruit_post.subject_name}`,
            api_link: `http://localhost:8000/api/recruit_post/${recruit_post._id}`,
        })
        notification.save()
    } else {
        recruit_post.likes.pop(user._id)
    }
    await recruit_post.save()

    const post = await recruitPostModel.findById(recruit_post._id).populate(populate_recruit_post_config)

    if (post) {
        res.status(201).json(post)
    } else {
        res.status(400)
        throw new Error('Invalid recruit post')
    }
})

const commentRecruitPost = asyncHandler(async (req, res) => {
    const user = req.user
    if (!req.params['_id']) {
        res.status(401)
        throw new Error('recruit_post_id not found')
    }
    const recruit_post = await recruitPostModel.findById(req.params['_id'])
    if (!recruit_post) {
        res.status(401)
        throw new Error('recruit_post not found')
    }
    if (!req.body['comment']) {
        res.status(401)
        throw new Error('Please add a comment')
    }
    const comment = await commentModel.create({
        owner_id: user._id,
        comment: req.body['comment']
    })
    if (!comment) {
        res.status(401)
        throw new Error('Invalid comment')
    }
    recruit_post.comments.push(comment._id)
    await recruit_post.save()
    const post = await recruitPostModel.findById(recruit_post._id).populate(populate_recruit_post_config)
    if (post) {
        res.status(201).json(post)
    } else {
        res.status(400)
        throw new Error('Invalid recruit post')
    }
})

const requestedRecruitPost = asyncHandler(async (req, res) => {
    const user = req.user
    // check role user
    if (user.role !== 'student') {
        res.status(401)
        throw new Error('User not allowed to request because the user is not student role')
    }
    if (!req.params['_id']) {
        res.status(401)
        throw new Error('schedule_id not found')
    }
    const schedule = await scheduleModel.findById(req.params['_id'])
    const recruit_post = await recruitPostModel.findById(schedule.recruit_post_id)
    // check expired date
    if (new Date().getTime() > recruit_post.expired.getTime()) {
        recruit_post.isOpened = false
        recruit_post.save()
        res.status(401)
        throw new Error('User cannot requested or unrequested because recruit post is expired')
    }

    // check requirement year
    const set = new Set(recruit_post.requirement_year)
    if (recruit_post.requirement_year.length < set.add(user.student_year).size) {
        res.status(401)
        throw new Error('User cannot request because student_year is not allowes requirement_year')
    }

    // check requirement grade


    if (!schedule) {
        res.status(401)
        throw new Error('schedule not found')
    }

    // check requese in other schedules
    const other_requests = await scheduleModel.findOne({ recruit_post_id: recruit_post._id, requested: user._id })
    if (other_requests && schedule.section !== other_requests.section) {
        res.status(401)
        throw new Error('User cannot duplicate request in other schedules')
    }

    // check requested toggle
    const requested = await scheduleModel.find({ _id: req.params['_id'], requested: user._id })
    if (!requested.length) {
        // check max_ta
        if (schedule.accepted.length >= schedule.max_ta) {
            res.status(401)
            throw new Error('failed requested because accepted users exceed')
        }
        // create notification
        const notification = await notificationModel.create({
            receiver_id: recruit_post.owner_id,
            event_type: 'recruitPostModel requested',
            description: `คุณ ${user.firstname} ${user.lastname} ได้กด request โพสต์รับ TA ของคุณ วิชา ${recruit_post.subject_id} ${recruit_post.subject_name} ที่ section ${schedule.section}`,
            api_link: `http://localhost:8000/api/recruit_post/${recruit_post._id}`,
        })
        notification.save()
        schedule.requested.push(user._id)
    } else {
        // check cannot unrequest if owner_post accepted you
        const accepted = await scheduleModel.find({ _id: req.params['_id'], accepted: user._id })
        if (accepted.length) {
            res.status(401)
            throw new Error('User cannot unrequest because teacher has accepcted your request')
        }
        schedule.requested.pull(user._id)
    }
    schedule.save()
    const post = await recruitPostModel.findById(recruit_post._id).populate(populate_recruit_post_config)

    if (schedule && post) {
        res.status(201).json(post)
    } else {
        res.status(400)
        throw new Error('Invalid schedule')
    }
})

const acceptedRecruitPost = asyncHandler(async (req, res) => {
    const user = req.user
    if (!req.params['schedule_id']) {
        res.status(401)
        throw new Error('recruit_post_id not found')
    }

    const schedule = await scheduleModel.findById(req.params['schedule_id'])
    if (!schedule) {
        res.status(401)
        throw new Error('schedule not found')
    }
    // check user id == owner recruit post id
    const recruit_post = await recruitPostModel.findById(schedule.recruit_post_id)
    if (!recruit_post) {
        res.status(401)
        throw new Error('recruit_post not found')
    }
    if (user._id.toString() !== recruit_post.owner_id.toString()) {
        res.status(401)
        throw new Error('User is not owner of the recruited post')
    }

    // check cancelled to request or user_id not found in requested schedule
    const requested = await scheduleModel.find({ _id: req.params['schedule_id'], requested: req.params['user_id'] })
    if (!requested.length) {
        res.status(401)
        throw new Error('User cancelled to request or User not found in the schedule')
    }
    // check accepted toggle
    const accepted = await scheduleModel.find({ _id: req.params['schedule_id'], accepted: req.params['user_id'] })
    if (!accepted.length) {
        // check max_ta
        if (schedule.accepted.length >= schedule.max_ta) {
            res.status(401)
            throw new Error('Owner cannot accepted bacause accepted users exceed')
        }
        schedule.accepted.push(req.params['user_id'])
        // create notification
        const notification = await notificationModel.create({
            receiver_id: req.params['user_id'],
            event_type: 'recruitPostModel accepted',
            description: `คุณได้รับการตอบรับการเป็น TA จากอาจารย์ที่เป็นเจ้าของโพสต์รับ TA วิชา ${recruit_post.subject_id} ${recruit_post.subject_name} ที่ section ${schedule.section} สามารถเข้าไปเยี่ยมชม Community ของโพสต์นี้ได้ ณ ตอนนี้`,
            api_link: `http://localhost:8000/api/community/${recruit_post.community_id}`,
        })
        notification.save()
    } else {
        schedule.accepted.pull(req.params['user_id'])
    }

    schedule.save()
    const post = await recruitPostModel.findById(recruit_post._id).populate(populate_recruit_post_config)

    if (schedule && post) {
        res.status(201).json(post)
    } else {
        res.status(400)
        throw new Error('Invalid schedule')
    }
})

module.exports = {
    getRecruitPost, getRecruitPosts, setRecruitPost, likeRecruitPost, commentRecruitPost, requestedRecruitPost, acceptedRecruitPost
}