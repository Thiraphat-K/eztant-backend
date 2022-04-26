const { default: mongoose } = require("mongoose");

const semesterGradeSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'userModel',
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        maxLength: 20,
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add a subject_id'],
        ref: 'userModel',
    }],
})

module.exports = mongoose.model('semesterGradeModel', semesterGradeSchema)