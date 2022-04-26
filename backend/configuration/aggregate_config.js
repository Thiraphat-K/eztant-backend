const aggregate_config = [
    {
        $lookup: {
            from: "usermodels",
            localField: "owner_id",
            foreignField: "_id",
            as: "owner_id"
        }
    },
    {
        $unwind: '$owner_id'
    },
    {
        $lookup: {
            from: "schedulemodels",
            localField: "schedules",
            foreignField: "_id",
            as: "schedules"
        }
    },
    // {
    //     $lookup: {
    //         from: "usermodels",
    //         localField: "likes",
    //         foreignField: "_id",
    //         as: "likes"
    //     }
    // },
    {
        $lookup: {
            from: "commentmodels",
            localField: "comments",
            foreignField: "_id",
            as: "comments"
        }
    },
    {
        "$project": {
            // "_id": 1,
            // "owner_id": 1,
            // "owner_id._id": 1,
            // "owner_id.email": 1,
            "owner_id.firstname": 1,
            "owner_id.lastname": 1,
            "owner_id.department": 1,
            // "owner_id.role": 1,
            // "owner_id.img_url": 1,
            "subject_name": 1,
            "subject_id": 1,
            "wage": 1,
            "requirement_grade": 1,
            "requirement_year": 1,
            "description": 1,
            "duty": 1,
            "schedules": 1,
            "comments": 1,
            "likes": 1,
            "likes_length": { "$size": "$likes" },
        }
    },
]

module.exports = {aggregate_config}