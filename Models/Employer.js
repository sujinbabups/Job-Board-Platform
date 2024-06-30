const {Schema,model}= require('mongoose')
const { type } = require('os')

const demo=new Schema({
    company_name:{type:String,required:true},
    company_type:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},


})


const sample=model('employers',demo)
module.exports=sample;