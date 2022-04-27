const populate_recruit_post_config = [
    {
        path: 'owner_id',
        select: '_id email firstname lastname role department img_url'
    },
    [{
        path: 'schedules',
        select: ' -__v',
        populate: [
            [{
                path: 'requested',
                select: '_id email firstname lastname student_id student_year role department img_url'
            }],
            [{
                path: 'accepted',
                select: '_id email firstname lastname student_id student_year role department img_url'
            }],
        ]
    }],
    [{
        path: 'comments',
        select: '-_id -updatedAt -__v',
        populate: [
            {
                path: 'owner_id',
                select: '_id email firstname lastname role department img_url'
            },
        ]
    }],
    [{
        path: 'likes',
        select: '_id email firstname lastname role department img_url'
    }],
]
const populate_community_config = [
    {
        path: 'recruit_post_id',
        populate: [
            {
                path: 'owner_id',
                select: '-password -updatedAt -__v'
            },
            {
                path: 'schedules',
            },
        ],
    },
    {
        path: 'community_posts',
        select: '_id description likes comments createdAt',
        populate: [
            {
                path: 'owner_id',
                select: '_id email firstname lastname role department img_url'
            },
            {
                path: 'likes',
                select: '_id email firstname lastname role department img_url',
            },
            {
                path: 'comments',
                select: '-_id -updatedAt -__v',
                populate: {
                    path: 'owner_id',
                    select: '_id email firstname lastname role department img_url'
                }
            }
        ]
    }
]

const populate_community_post_config = [
    {
        path: 'owner_id',
        select: '_id email firstname lastname role department img_url'
    },
    {
        path: 'likes',
        select: '_id email firstname lastname role department img_url',
    },
    {
        path: 'comments',
        select: '-updatedAt -__v',
        populate: {
            path: 'owner_id',
            select: '_id email firstname lastname role department img_url'
        }
    }
]



module.exports = {
    populate_community_config, populate_recruit_post_config, populate_community_post_config
}