const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv.config();

const { check, validationResult } = require('express-validator');

const Candidate_Reg = require('./Models/candidate_reg');

const adminCollection = require('./Models/admin');

const employers = require('./Models/Employer');


const job_list = require('./Models/joblist')

const Application = require('./Models/Applications');

app.use(bodyParser.urlencoded({ extended: true }));

const { hash } = require('crypto');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const url = process.env.mongo_uri;
mongoose.connect(url);

const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error);
});

database.once('connected', () => {
    console.log('Connected to database');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/recruiters', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recruiters.html'));
});

app.get('/candidate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'candidate.html'));
});

app.get('/employer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employer.html'));
});

app.get('/admin_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

//user registration

app.post('/can-reg', async (req, res) => {
    try {
        const { fname, lname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newUser = new Candidate_Reg({
            fname,
            lname,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//user authentication
function isAuthenticated(req, res, next) {
    const token = req.cookies.AuthToken;
    if (!token) {
        return res.redirect('/canLogin');
    }
    try {
        const decoded = jwt.verify(token, "your-secret-key");
        req.user = decoded;
        next();
    } catch (err) {
        res.redirect('/canLogin');
    }
}

app.post('/canLogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Candidate_Reg.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            "your-secret-key",
            { expiresIn: "1h" }
        );

        res.cookie("AuthToken", token, { httpOnly: true });
        res.json({
            status: true,
            message: "login success",
            token,
            userType: user.userType,
            redirect: '/candidate'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});




app.get('/candidate', isAuthenticated, (req, res) => {
    res.send('Welcome to the candidate page');
});


app.get("/logout", (req, res) => {
    res.clearCookie("AuthToken", { httpOnly: true });
    res.status(200).redirect('/');
});


//Admin Register 

// app.post('/admin_reg',async (req,res)=>{
//     try{
//         const {username,password}=req.body;
//         const hashedPassword=await bcrypt.hash(password,10);
//         const newAdmin=new adminCollection({
//             username,password:hashedPassword
//         })
//         await newAdmin.save();
//         res.status(201).json({message:'reg success'})
//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({message:"server error"})
//     }
// })
//Admin Login 

app.post('/admin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await adminCollection.findOne({ username });
        // console.log(admin);

        if (!admin) {
            return res.status(400).json({ message: 'Invalid username or password' })
        }

        const isMatch = await bcrypt.compare(password, admin.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password ' })
        }
        res.status(200).json({ message: "Login Success" })


    }
    catch (error) {
        console.log(error);
        // res.status(500).json({message:'Server error'})
    }
}
)

// Employer Register
app.post('/emp-reg', async (req, res) => {
    try {
        const { co_name, co_type, place, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const emp = new employers({
            co_name,
            co_type,
            place,
            email,
            password: hashedPassword,
        });
        await emp.save();
        res.status(201).json({ message: 'Registration Success' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
});






//Employer Login 
app.post('/employer-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const employer = await employers.findOne({ email });

        if (!employer) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, employer.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: employer._id, email: employer.email },
            "your-secret-key",
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login Success",
            
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});


//Adding an employer by admin

app.post('/add-employer', async (req, res) => {
    try {
        const { employer_id, co_name, co_type, place, email } = req.body;
        const new_emp = new employers({
            employer_id,
            co_name,
            co_type,
            place,
            email,
        });
        await new_emp.save();
        res.status(201).json({ message: "Added new employer" });
    } catch (error) {
        console.log(error);
        // res.status(500).json({ message: "Server error" });
    }
});

//Viewing the employers by admin

app.get('/get-employers', async (req, res) => {
    try {
        const employer = await employers.find();
        res.status(200).json(employer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


//adding employee id to the select tag

app.get('/employers', async (req, res) => {
    try {
        const employer = await employers.find({}, 'employer_id');
        res.status(200).json(employer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//getting the selected id to the table 

app.get('/employer/:id', async (req, res) => {
    try {
        const employer = await employers.findOne({ employer_id: req.params.id });
        if (employer) {
            res.status(200).json(employer);
        } else {
            res.status(404).json({ message: "Employer not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//deleting the employers based on id by admin 
app.delete('/delete/:id', async (req, res) => {
    try {
        const employerID = req.params.id;
        const result = await employers.deleteOne({ employer_id: employerID });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Employer deleted successfully" });
        } else {
            res.status(404).json({ message: "Employer not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//Adding a job by employer

app.post('/add-job', async (req, res) => {
    try {
        const { job_id, job_name, location, skills, description } = req.body;

        // console.log(job_id);
        const new_job = new job_list({
            job_id,
            job_name,
            location,
            skills,
            description,
        });

        await new_job.save();
        res.status(201).json({ message: "Added new job" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



//getting the users name and password to users dashboard



//getting the details to home

app.get('/get-jobs', async (req, res) => {
    try {
        const jobs = await job_list.find();
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Apply for a Job
app.post('/apply-job', async (req, res) => {
    const { jobId, userName } = req.body;
    console.log('Applying for Job ID:', jobId);
    console.log(userName);

    try {
        const authHeader = req.headers['AuthToken'];
        if (!authHeader) {
            console.error('No authorization header provided');
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.error('No token provided');
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, "your-secret-key");
        const user = await Candidate_Reg.findById(decoded.userId);

        if (!user) {
            console.error('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User Information:', user);

        const application = new Application({
            userId: user._id,
            userName: user.name,
            jobId,
            skills: user.skills,
            status: 'pending',
        });

        await application.save();

        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error during application submission:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



const port = 3000;
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
