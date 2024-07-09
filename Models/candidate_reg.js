const {Schema,model}= require('mongoose')
const { type } = require('os')

const demo=new Schema({
    fname:{type:String,required:true},
    lname:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    userType:{type:String,required:true}


})


const sample=model('Candidate_Reg',demo)
module.exports=sample;