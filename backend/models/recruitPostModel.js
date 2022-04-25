const { default: mongoose } = require("mongoose");

const recruitPostSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'userModel'
    },
    community_id:{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'communityModel'
    },
    subject_name: {
        type: String,
        require: [true, 'Please add a subject_name'],
        maxLength: 100,
    },
    subject_id: {
        type: String,
        require: [true, 'Please add a subject_id'],
        maxLength: 8
    },
    wage: {
        type: Number,
        require: [true, 'Please add a wage'],
        min: [0, 'Please add a wage in range 0-99999'],
        max: [99999, 'Please add a wage in range 0-99999'],
    },
    requirement_grade: {
        type: String,
        require: [true, 'Please add a requirement_grade'],
        maxLength: 2
    },
    requirement_year: [{
        type: Number,
        require: [true, 'Please add a requirement_year'],
        min: [1, 'Please add a requirement_year in range 1-8'],
        max: [8, 'Please add a requirement_year in range 1-8']
    }],
    description: {
        type: String,
        require: false,
        // require: [true, 'Please add a description'],
        maxLength: 500,
    },
    duty: {
        type: String,
        require: false,
        // require: [true, 'Please add a duty']
        maxLength: 500,
    },
    schedules: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'scheduleModel'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'userModel'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'commentModel'
    }],
    isOpened: {
        type: Boolean,
        default: true,
    },
    expired: {
        type: Date,
        require: [true, 'Please add a expired'],
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('recruitPostModel', recruitPostSchema)