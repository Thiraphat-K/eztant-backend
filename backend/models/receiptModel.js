const { default: mongoose } = require("mongoose");

const receiptModel = mongoose.Schema({
    community_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, 'Please add a community_id']
    },
    sections: [{
        section: {
            type: Number,
            require: [true, 'Please add a section'],
            min: [0, 'Please add a subject_id in range 000-999'],
            max: [999, 'Please add a subject_id in range 000-999'],
        },
        records_by_section: [{
            owner_id: {
                type: mongoose.Schema.Types.ObjectId,
                require: true,
                ref: 'userModel'
            },
            records_by_student: [{
                attend_date: {
                    type: Date,
                    require: [true, 'Please add a attend_date']
                },
                check_by_teacher: {
                    type: Boolean,
                    require: [true, 'Please add a check_by_teacher']
                }
            }],
            wages: {
                type: Number,
                require: [true, 'Please add a wages'],
                min: [0, 'Please add a wages in range 0-99999'],
                max: [99999, 'Please add a wages in range 0-99999'],
            }
        }]
    }]

}, {
    timestamps: true
})

module.exports = mongoose.model('receiptModel', receiptModel)