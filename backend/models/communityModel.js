const { default: mongoose } = require("mongoose");

const communitySchema = mongoose.Schema({
    recruit_post_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'recruitPostModel'
    },
    theme_color: {
        type: String,
        // require: [true, 'Please add a themem_color'],
        require: [true, 'โปรดใส่สีธีม'],
        maxLength: 8,
    },
    community_posts:[{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'communityPostModel'
    }],
    attendances: [{
        type: mongoose.Schema.Types.ObjectId,
        require: false,
        ref: 'attendanceModel',
    }],
},{
    timestamps : true
})

module.exports = mongoose.model('communityModel', communitySchema)