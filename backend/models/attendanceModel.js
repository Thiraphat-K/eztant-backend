const { default: mongoose } = require("mongoose");

const attendanceSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'userModel'
    },
    community_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'communityModel',
    },
    section: {
        type: Number,
        required: [true, 'Please add a section'],
        min: [0, 'Please add a subject_id in range 000-999'],
        max: [999, 'Please add a subject_id in range 000-999'],
    },
    attend_date: {
        type: Date,
        require: [true, 'Please add a attend_date']
    },
    check_by_teacher: {
        type: Boolean,
        default: false
    },
    evidence_url: {
        type: String,
        require: [true, 'Please add a evidence_url'],
        maxLength: 100,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('attendanceModel', attendanceSchema)