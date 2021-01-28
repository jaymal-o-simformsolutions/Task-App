const express = require('express');
const _ = require('lodash');
const sharp = require('sharp');
const multer = require('multer');
const router = express.Router();
const User = require('../model/user');
const auth = require('../middleware/auth');




router.post('/user',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
         const token =  await user.generateToken() 
         res.cookie('token',  token, {
            expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
          })
         res.send({user,token})   
    }catch(err){
      res.status(400).send(err)
    }
   
 }) 

 router.post('/login', async(req,res)=>{
     try{
         const user = await User.findbyemail(req.body.email,req.body.password)
         const token = await user.generateToken()
           res.cookie('token',  token, {
            expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
          })
          res.send({user,token})

     }catch(err){
         res.status(400).send({err})
     }
 })
 
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file, cb){
          const extension = file.originalname.toLowerCase().endsWith('.jpg') || file.originalname.toLowerCase().endsWith('.png') || file.originalname.toLowerCase().endsWith('jpeg')
        if(!extension){
            cb(new Error('file extension must be jpg,png,jpeg')) 
        }
        cb(undefined,true)
    }
})

router.post('/user/me/avatar',auth,upload.single('avatar'),async(req, res) => { 
      const buffer = await sharp(req.file.buffer).resize({width:300,height:300}).png().toBuffer()
     req.user.avatar = buffer
    await req.user.save()  
     res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({error:error.message}) 
})

router.delete('/user/me/delete',auth,async(req,res)=>{ 
    try{ 
           req.user.avatar = undefined
            await req.user.save()
           res.send(req.user)
    }catch(error){
         res.status(500).send()
    }
    

})

 router.get('/user/:id/avatar',async(req,res)=>{
      try{
      const user = await User.findById(req.params.id)
         if(!user || !user.avatar){
             throw new Error()
         }
         res.set('Content-type','image/png')
         res.send(user.avatar)
      }catch(e){

      }
 })

 router.post('/logout',auth,async(req,res)=>{   
    try{
      req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
         res.send()
    }catch(e){
        res.status(500).send(e)
    }
 })

 router.post('/logoutAll', auth, async (req,res)=>{
     try{
        req.user.tokens = []
        await req.user.save()
        res.send()
   
     }catch(err){
         res.status(500).send(err)
     }
 })



 router.get('/user', auth,(req,res)=>{
    res.send(req.user)
 })
 
 


router.put('/user', async(req,res)=>{
    try{
       const user = await User.updateMany({name:'jay'},req.body)
       await user.save()
        res.send(user)
       
    }catch(err){
          res.status(500).send(err)
    }
})

router.put('/user/me', auth,async(req,res)=>{
    try{
        _.extend(req.user,req.body)
          await req.user.save()
       res.send(req.user)
    }catch(err){
         res.status(400).send(err) 
    }  
})

router.delete('/user/me', auth,async(req,res)=>{
    try{
      await req.user.remove()
       res.send(req.user)
    }catch(err){
         res.status(500).send(err) 
    }
})


module.exports = router