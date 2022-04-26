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
        maxLength: 8
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
        // min: [0, 'Please add id in range 00000000-99999999'],
        // max: [99999999, 'Please add id in range 00000000-99999999'],
        min: [0, 'โปรดใส่รหัสนักศึกษา (00000000-99999999)'],
        max: [99999999, 'โปรดใส่รหัสนักศึกษา (00000000-99999999)'],
    },
    semesters: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'semesterModel'
    }],
})

module.exports = mongoose.model('transcriptModel', transcriptSchema)