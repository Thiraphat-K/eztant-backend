const express = require('express')
const colors = require('colors')
const connectDatabase = require('./configuration/database')
const { errorHandler } = require('./middleware/errorMiddleware')
const dotenv = require('dotenv').config()
const port = process.env.PORT || 5000
const FileUp = require('express-fileupload');


const cors = require('cors')

connectDatabase()

const app = express()

app.use(cors())
app.use(FileUp());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.json({ limit: '2MB' }));
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/recruit_post', require('./routes/recruitPostRoutes'))
app.use('/api/notification', require('./routes/notificationRoutes'))
app.use('/api/community', require('./routes/communityRoutes'))
app.use('/api/delete_database', require('./routes/deleteDatabaseRoutes'))

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server started on port ${port} : ${new Date().toLocaleString()}`);
})