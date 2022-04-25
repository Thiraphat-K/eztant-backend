const populate_recruit_post_config = [
    {
        path: 'owner_id',
        select: '_id firstname lastname role img_url'
    },
    [{
        path: 'schedules',
        select: ' -__v',
        populate: [
            [{
                path: 'requested',
                select: '_id firstname lastname student_id student_year role img_url'
            }],
            [{
                path: 'accepted',
                select: '_id firstname lastname student_id student_year role img_url'
            }],
        ]
    }],
    [{
        path: 'comments',
        select: '-_id -updatedAt -__v',
        populate: [
            {
                path: 'owner_id',
                select: '_id firstname lastname role img_url'
            },
        ]
    }],
    [{
        path: 'likes',
        select: '_id firstname lastname role img_url'
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

module.exports = {
    populate_community_config, populate_recruit_post_config
}