const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const User = require('./model/user')
const Task = require('./model/task')
const userrouter = require('./route/user')
const taskrouter = require('./route/task')
const app = express()

const port = process.env.PORT 
mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser:true,useFindAndModify:false},(err)=>{
    if(err){
        console.log('something went wrong')
    }
    console.log('DB connected successfully') 
})



app.use(express.json())
app.use(cookieParser())

app.use(userrouter)
app.use(taskrouter)

app.listen(port,()=>{
    console.log('listening on port '+ port) 
})