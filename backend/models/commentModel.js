const { default: mongoose } = require("mongoose");

const commentSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:'userModel'
    },
    comment: {
        type: String,
        require: [true, 'Please add a comment'],
        maxLength: 200
    }
},{
    timestamps: true
})

module.exports = mongoose.model('commentModel',commentSchema)