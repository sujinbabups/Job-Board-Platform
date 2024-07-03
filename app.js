const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// const express = require('express');
const session = require('express-session');
// const bcrypt = require('bcrypt');
// const mongoose = require('mongoose');

// const app = express();
app.use(express.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Define your mongoose model and connect to your database
const Candidate_Reg = mongoose.model('Candidate_Reg', new mongoose.Schema({
    email: String,
    password: String,
    name: String
}));


dotenv.config();
// const Candidate_Reg = require('./Models/candidate_reg');

const adminCollection = require('./Models/admin');

const employers = require('./Models/Employer');

const emp_list = require('./Models/employers_list')

const job_list = require('./Models/joblist')
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

app.post('/canLogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Candidate_Reg.findOne({ email });
        // console.log(user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        req.session.userId = user._id;
        res.status(200).json({ message: 'Login successful'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
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

//Employer Register
app.post('/emp-reg', async (req, res) => {
    try {
        const { company_name, company_type, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const emp = new employers({
            company_name,
            company_type, email,
            password: hashedPassword,
        })
        await emp.save();
        res.status(201).json({ message: 'Registration Success' })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' })
    }
})

//Employer Login 
app.post('/employer-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const employer = await employers.findOne({ email });
        console.log(employer);

        if (!employer) {
            return res.status(400).json({ message: 'Invalid username or password' })
        }

        const isMatch = await bcrypt.compare(password, employer.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password ' })
        }
        res.status(200).json({ message: "Login Success" })


    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' })
    }
}

)

//Adding an employer by admin

app.post('/add-employer', async (req, res) => {
    try {
        const { employer_id, co_name, co_type, place, email } = req.body;
        const new_emp = new emp_list({
            employer_id,
            co_name,
            co_type,
            place,
            email,
        });
        await new_emp.save();
        res.status(201).json({ message: "Added new employer" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" })
    }
})

//Viewing the employers by admin

app.get('/get-employers', async (req, res) => {
    try {
        const employers = await emp_list.find();
        res.status(200).json(employers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


//adding employee id to the select tag

app.get('/employers', async (req, res) => {
    try {
        const employers = await emp_list.find({}, 'employer_id');
        res.status(200).json(employers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//getting the selected id to the table 

app.get('/employer/:id', async (req, res) => {
    try {
        const employer = await emp_list.findOne({ employer_id: req.params.id });
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
        const result = await emp_list.deleteOne({ employer_id: employerID });

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

app.get('/get-user', async (req, res) => {

    if(!req.session.userId){
        return res.status(401).json({message:'Not authenticated'})
    }
    try {
        // Assuming you have a middleware to authenticate the user and set req.user
        // const email = Candidate_Reg.email;  // or however you store the logged-in user ID
        // console.log();
        const user = await Candidate_Reg.findById(req.session.email, 'name email');  // Adjust as per your user model
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

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

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
