const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new Schema({ 
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required: true,
        trim: true,
        minLength:6,
        validate(value){
            if(value.includes('password')){
                throw new Error('password is  not password')
            }
        }
    },
    age:{
        type:Number,
    },
    tokens:[{
           token:{
               type:String,
               required: true
           }  
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id', 
    foreignField:'user'
})

userSchema.methods.toJSON = function (){
    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.avatar
    return user
}

userSchema.methods.generateToken = async function(){
  const token = jwt.sign({_id:this._id},process.env.JWT_SECRET)  
   this.tokens = this.tokens.concat({token})
    await this.save()     
    return token 
}

userSchema.statics.findbyemail = async function(email,password) { 
     const user = await User.findOne({email})
    if(!user) throw new Error('unable to login')
    const isValid = await bcrypt.compare(password, user.password)
     if(!isValid) throw new Error('unable to login')
     return user
}

userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
      user.password =   await bcrypt.hash(user.password,8) 
    }

    next() 
})
 
userSchema.pre('remove',async function(next){
   await Task.deleteMany({ user:this._id})
   next()
})
 
const User = mongoose.model('User',userSchema) 

module.exports = User 



    