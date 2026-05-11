const express = require('express')
const cors = require('cors')
const routes = require('./routes')
 
require('dotenv').config()
 
const app = express();
 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', routes)
 
app.listen(process.env.PORT || 21010)