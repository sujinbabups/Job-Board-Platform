const {Schema,model}= require('mongoose')
const { type } = require('os')

const demo=new Schema({

    username:{type:String,required:true},
    password:{type:String,required:true},


})


const sample=model('admin',demo)
module.exports=sample;