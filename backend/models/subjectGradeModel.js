const { default: mongoose } = require("mongoose");

const subjectGradeSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'userModel',
    },
    subject_id: {
        type: String,
        require: [true, 'Please add a subject_id'],
        maxLength: 10,
    },
    subject_name: {
        type: String,
        require: [true, 'Please add a subject_id'],
        maxLength: 100,
    },
    subject_grade: {
        type: String,
        require: [true, 'Please add a subject_id'],
        maxLength: 2,
    }
})

module.exports = mongoose.model('subjectGradeModel', subjectGradeSchema)