const { default: mongoose } = require("mongoose");

const transcriptSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add a owner_id'],
        ref: 'userModel'
    },
    firstname: {
        type: String,
        required: [true, 'Please add a firstname'],
        maxLength: 25
    },
    lastname: {
        type: String,
        required: [true, 'Please add a lastname'],
        maxLength: 25
    },
    student_id: {
        type: Number,
        required: false,
        unique: true,
        sparse: true,
        min: [0, 'Please add id in range 00000000-99999999'],
        max: [99999999, 'Please add id in range 00000000-99999999'],
    },
    semesters: [{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'semesterModel'
    }],
})

module.exports = mongoose.model('transcriptModel', transcriptSchema)