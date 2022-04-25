const { default: mongoose } = require("mongoose");

const scheduleSchema = mongoose.Schema({
    recruit_post_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'recruitPostModel',
    },
    section: {
        type: Number,
        required: [true, 'Please add a section'],
        min: [0, 'Please add a subject_id in range 000-999'],
        max: [999, 'Please add a subject_id in range 000-999'],
    },
    day: {
        type: String,
        required: [true, 'Please add a day'],
        maxLength: 10,
    },
    time_from: {
        type: String,
        required: [true, 'Please add a time_from'],
        maxLength: 5,
    },
    time_to: {
        type: String,
        required: [true, 'Please add a time_to'],
        maxLength: 5,
    },
    max_ta: {
        type: Number,
        required: [true, 'Please add a max_ta'],
        min: [1, 'Please add a max_ta in range 1-10'],
        max: [10, 'Please add a max_ta in range 1-10'],
    },
    requested: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'userModel',
    }],
    accepted: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'userModel',
    }],
}, {
    timestamps: true
})

module.exports = mongoose.model('scheduleModel', scheduleSchema)