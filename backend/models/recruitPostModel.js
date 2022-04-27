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
        // require: [true, 'Please add a subject_name'],
        require: [true, 'โปรดใส่ชื่อวิชา'],
        maxLength: 50,
    },
    subject_id: {
        type: String,
        // require: [true, 'Please add a subject_id'],
        require: [true, 'โปรดใส่รหัสวิชา'],
        maxLength: 8
    },
    wage: {
        type: Number,
        // require: [true, 'Please add a wage'],
        // min: [0, 'Please add a wage in range 0-99999'],
        // max: [99999, 'Please add a wage in range 0-99999'],
        require: [true, 'โปรดใส่ค่าตอบแทน'],
        min: [0, 'โปรดใส่ค่าตอบแทน (0-99999)'],
        max: [99999, 'โปรดใส่ค่าตอบแทน (0-99999)'],
    },
    requirement_grade: {
        type: String,
        // require: [true, 'Please add a requirement_grade'],
        require: [true, 'โปรดใส่เกรดที่ต้องการ'],
        maxLength: 2
    },
    requirement_year: [{
        type: Number,
        // require: [true, 'Please add a requirement_year'],
        // min: [1, 'Please add a requirement_year in range 1-8'],
        // max: [8, 'Please add a requirement_year in range 1-8']
        require: [true, 'โปรดใส่ชั้นปีที่ต้องการ'],
        min: [1, 'โปรดใส่ชั้นปีที่ต้องการ (1-4)'],
        max: [6, 'โปรดใส่ชั้นปีที่ต้องการ (1-4)']
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
    department: {
        type: String,
        // require: false,
        require: [true, 'Please add a department'],
        maxLength: 30,
    },
    isOpened: {
        type: Boolean,
        default: true,
    },
    expired: {
        type: Date,
        // require: [true, 'Please add a expired'],
        require: [true, 'โปรดใส่ระยะเวลาการเปิดรับสมัคร'],
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('recruitPostModel', recruitPostSchema)