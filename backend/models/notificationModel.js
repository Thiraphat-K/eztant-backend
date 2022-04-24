const { default: mongoose } = require("mongoose");

const notificationSchema = mongoose.Schema({
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, 'Please add a event type'],
        ref: 'userModel'
    },
    event_type: {
        type: String,
        require: [true, 'Please add a event type'],
        maxLength: 50,
    },
    description: {
        type: String,
        require: [true, 'Please add a description'],
        maxLength: 250,
    },
    api_link: {
        type: String,
        require: [true, 'Please add a api_url'],
        maxLength: 100,
    },
    is_watched: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    // toJSON: {
    //     virtuals: true
    // }
})

// notificationSchema.virtual('fromRecruitPostModel',{
//     ref: 'recruitPostModel',
//     localField: 'event_id',
//     foreginField: '_id',
//     justOne: true
// })

module.exports = mongoose.model('notificationModel', notificationSchema)