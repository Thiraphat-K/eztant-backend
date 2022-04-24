const { default: mongoose } = require("mongoose");

const connectDatabase = async () => {
    try {
        const connected = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected at ${connected.connection.host} : ${new Date().toLocaleString()}`.underline);
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

module.exports = connectDatabase