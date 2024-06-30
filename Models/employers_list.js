const {Schema,model}= require('mongoose')
const { type } = require('os')

const demo=new Schema({
    employer_id:{type:String,required:true},
    co_name:{type:String,required:true},
    place:{type:String,required:true},
    co_type:{type:String,required:true},
    email:{type:String,required:true},
    


})


const sample=model('Employer_list',demo)
module.exports=sample;