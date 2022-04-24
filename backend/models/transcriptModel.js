const { default: mongoose } = require("mongoose");

const transcriptSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, 'Please add a owner_id'],
    },
    subject_id: {
        type: String,
        require: [true, 'Please add a subject_id'],
        maxLength: 8
    },
    subject_name: {
        type: String,
        require: [true, 'Please add a subject_name'],
        maxLength: 100
    },
    study_semester: {
        type: Number,
        require: [true, 'Please add a study_semester'],
        min: [1, 'Please add a study_semester in range 1-4'],
        max: [4, 'Please add a study_semester in range 1-4']
    },
    study_year: {
        type: Number,
        require: [true, 'Please add a study_year'],
        min: [1900, 'Please add a study_semester in range 1900-2100'],
        max: [2100, 'Please add a study_semester in range 1900-2100']
    },
    grade: {
        type: String,
        require: [true, 'Please add a grade'],
        maxLength: 4
    }
})

module.exports = mongoose.model('transcriptModel', transcriptSchema)