const asyncHandler = require('express-async-handler')
const communityModel = require('../models/communityModel')
const recruitPostModel = require('../models/recruitPostModel')
const scheduleModel = require('../models/scheduleModel')

const accessible_community = asyncHandler(async (req, res, next) => {
    // try {
    const community_id = req.params['community_id']
    req.recruit_post = await recruitPostModel.findOne({ community_id: community_id }).populate('schedules')
    if (!req.recruit_post) {
        res.status(401)
        // throw new Error('Community not found')
        throw new Error('ไม่พบคอมมูนิตี้')
    }
    const schedules = await scheduleModel.find({ recruit_post_id: req.recruit_post._id, accepted: req.user._id })
    if (schedules.length > 1) {
        res.status(401)
        // throw new Error('User has duplicated schedules in the community')
        throw new Error('มีตารางสอนอยู่แล้ว')
    }
    const schedule = await scheduleModel.findOne({ recruit_post_id: req.recruit_post._id, accepted: req.user._id })
    if (req.user.role == 'student' && !schedule) {
        res.status(401)
        // throw new Error('User has not accessible in community')
        throw new Error('ไม่สามารถเข้าถึงคอมมูนิตี้ได้')
    }
    if (req.user.role == 'teacher' && req.user._id.toString() !== req.recruit_post.owner_id.toString()) {
        res.status(401)
        // throw new Error('User has not accessible in community')
        throw new Error('ไม่สามารถเข้าถึงคอมมูนิตี้ได้')
    }
    req.community = await communityModel.findById(community_id).populate([
        {
            path: 'community_posts'
        },
        // {
        //     path: 'recruit_post_id',
        //     populate: [
        //         {
        //             path: 'owner_id',
        //         },
        //         {
        //             path: 'schedules',
        //             populate: [{
        //                 path: 'accepted'
        //             }]
        //         },
        //         {
        //             path: 'community_id'
        //         }
        //     ]
        // },
    ])
    if (!req.community) {
        res.status(401)
        // throw new Error('Community not found')
        throw new Error('ไม่พบคอมมูนิตี้')
    }
    next()
    // } catch (error) {
    //     res.status(401)
    //     throw new Error('Not accessed')
    // }



    // next()
})

module.exports = { accessible_community }