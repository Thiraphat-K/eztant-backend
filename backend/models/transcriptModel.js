const { default: mongoose } = require("mongoose");

const transcriptSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        // require: [true, 'Please add a owner_id'],
        require: [true, 'โปรดใส่รหัสนักศึกษา'],
    },
    firstname: {
        type: String,
        // require: [true, 'Please add a subject_id'],
        require: [true, 'โปรดใส่รหัสวิชา'],
        maxLength: 100
    },
    lastname: {
        type: String,
        // require: [true, 'Please add a subject_name'],
        require: [true, 'โปรดใส่ชื่อวิชา'],
        maxLength: 100
    },
    student_id: {
        type: Number,
        required: false,
        unique: true,
        sparse: true,
        min: [0, 'Please add id in range 00000000-99999999'],
        max: [99999999, 'Please add id in range 00000000-99999999'],
    },
    semesters: [],
}, { timestamps: true })

module.exports = mongoose.model('transcriptModel', transcriptSchema)