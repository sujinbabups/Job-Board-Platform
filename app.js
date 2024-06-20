const { log } = require('console');
const express = require('express');

const app = express();

const path= require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

certDetails=[];

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','jobBoardHome.html'))
})

app.get('/contact',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','/contact.html'))
})
app.get('/recruiters',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','/rectr.html'))
})

app.get('/employerhome',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','employerHome.html'))
})
app.get('/admin',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','adminHome.html'))
})


app.listen(3004)
console.log("Port service started");