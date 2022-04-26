const { default: mongoose } = require("mongoose");

const scheduleSchema = mongoose.Schema({
    recruit_post_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'recruitPostModel',
    },
    section: {
        type: Number,
        // required: [true, 'Please add a section'],
        // min: [0, 'Please add a subject_id in range 000-999'],
        // max: [999, 'Please add a subject_id in range 000-999'],
        require: [true, 'โปรดใส่กลุ่มเรียน'],
        min: [0, 'โปรดใส่กลุ่มเรียน (000 ถึง 999)'],
        max: [999, 'โปรดใส่กลุ่มเรียน (000 ถึง 999)'],
    },
    day: {
        type: String,
        // required: [true, 'Please add a day'],
        required: [true, 'โปรดใส่วัน'],
        maxLength: 10,
    },
    time_from: {
        type: String,
        // required: [true, 'Please add a time_from'],
        required: [true, 'โปรดใส่เวลาที่เริ่มการสอน'],
        maxLength: 5,
    },
    time_to: {
        type: String,
        // required: [true, 'Please add a time_to'],
        required: [true, 'โปรดใส่เวลาที่สิ้นสุดการสอน'],
        maxLength: 5,
    },
    max_ta: {
        type: Number,
        // required: [true, 'Please add a max_ta'],
        // min: [1, 'Please add a max_ta in range 1-10'],
        // max: [10, 'Please add a max_ta in range 1-10'],
        required: [true, 'โปรดใส่จำนวนที่รับ TA'],
        min: [1, 'โปรดใส่จำนวนที่รับ TA (1-10)'],
        max: [10, 'โปรดใส่จำนวนที่รับ TA (1-10)'],
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