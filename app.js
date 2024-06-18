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

app.get('/logDiv',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','#logDiv'))
})
app.get('/canReg',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','#canReg'))
})

app.get('/employerhome',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','employerHome.html'))
})


app.listen(3004)
console.log("Port service started");