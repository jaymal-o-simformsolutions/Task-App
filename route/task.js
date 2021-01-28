const express = require('express');
const router = express.Router()
const Task = require('../model/task')
const auth = require('../middleware/auth')




router.post('/createtask',auth,(req,res)=>{
    const task = new Task({...req.body, user: req.user})
     task.save().then(data=>{
         res.send(data)
     }).catch(err=>{
         res.status(400).send(err)
     })
})

router.get('/task', auth,async(req,res)=>{
    // let match = {}
    //  let sort = {}

    //  if(req.query.completed){
    //     match.completed = req.query.completed === 'true'
    //  }

    //  if(req.query.sortBy){
    //      console.log(req.query.sortBy)
    //      let data = req.query.sortBy.split(':')
    //      sort[data[0]] =  parseInt(data[1])
    //      console.log(sort)
    //  }
    try{
          
        const task = await Task.find({completed:req.query.completed === 'true' ,user: req.user}).populate('user').limit(parseInt(req.query.limit))
    //  await req.user.populate({ 
    //      path:'tasks',
    //      match,
    //      options:{
    //          limit:parseInt(req.query.limit),
    //          skip:+req.query.skip,
    //           sort
    //      },
    //  }).execPopulate()
         res.send(task)
    }catch(err){ 
        res.status(500).send(err)
    }

})

router.get('/task/:id',auth,async(req,res)=>{      
   try{
    const task = await Task.findOne( {_id:req.params.id,user: req.user._id})
     if(!task){
       return  res.status(404).send() 
     }
     res.send(task)
   }catch(err){
    res.status(500).send(err) 
   }
})


router.patch('/task/:id',auth,async(req,res)=>{
      const convetarray = Object.keys(req.body)
     const array = ['discription','completed']
     const checkinarray = convetarray.every(data=>array.includes(data))
      if(!checkinarray){
          return res.status(404).send()
      }
    try{
        const task = await Task.findOne({_id:req.params.id,user: req.user._id})
           convetarray.forEach(data=> task[data] = req.body[data])
           
       if(!task){
        return res.status(404).send({message:'Task not found'}) 
    }
          await task.save()

       res.send(task)
    }catch(err){ 
        res.status(400).send(err)
    }
})

router.delete('/task/:id', auth,async(req,res)=>{
    try{
        const task = await Task.findOneAndDelete( {_id:req.params.id, user:req.user._id})
        if(!task){
            return res.status(404).send({message:'Task not found'})
        }
           res.send(task)
        }catch(err){
            res.status(400).send(err)  
        }
}) 


module.exports = router