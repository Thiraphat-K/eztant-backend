const { default: mongoose } = require("mongoose");

const communityPostSchema = mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'userModel',
    },
    community_id: {
        type: mongoose.SchemaTypes.ObjectId,
        require: false,
        ref: 'communityModel',
    },
    description: {
        type: String,
        // require: [true, 'Plase add a description'],
        require: [true, 'โปรดใส่คำอธิบายเพิ่มเติม'],
        maxLength: 500
    },
    file_url: {
        type: String,
        require: false,
        maxLength: 100
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'userModel'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'commentModel'
    }],
}, {
    timestamps: true
})

module.exports = mongoose.model('communityPostModel', communityPostSchema)