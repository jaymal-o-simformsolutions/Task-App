const mongoose = require('mongoose')
const {ObjectId,Schema} = mongoose
const User = require('./user')

const taskSchema = new Schema({
    discription:{
        type: String,
        trim: true,
        required:true
    },
    completed:{
        type: Boolean,
        required:true,
        default:false
    },
    user:{
       type: ObjectId,
       required: true,
       ref:'User'

    }
},{
    timestamps:true
})


module.exports = mongoose.model('Task', taskSchema)



   