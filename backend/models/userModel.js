const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please add a email'],
        unique: true,
        lowercase: true,
        imutable: true,
        maxLength: 50,
    },
    password: {
        type: String,
        required: [true, 'Plase add a password'],
        maxLength: 100,
    },
    firstname: {
        type: String,
        required: [true, 'Please add a firstname'],
        maxLength: 25,
    },
    lastname: {
        type: String,
        required: [true, 'Please add a lastname'],
        maxLength: 25,
    },
    student_id: {
        type: Number,
        required: false,
        // required: [true, 'Please add a lastname'],
        unique: true,
        sparse: true,
        min: [0, 'Please add id in range 00000000-99999999'],
        max: [99999999, 'Please add id in range 00000000-99999999'],
    },
    student_year: {
        type: Number,
        required: false,
        // required: [true, 'Please add a lastname'],
        min: [1, 'Please add year in range 1-8'],
        max: [8, 'Please add year in range 1-8']
    },
    department: {
        type: String,
        required: [true, 'Please add a department'],
        maxLength: 25,
    },
    role: {
        type: String,
        required: [true, 'Please add a role'],
        maxLength: 25,
    },
    img_url: {
        type: String,
        required: false,
        maxLength: 200,
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model('userModel', userSchema)