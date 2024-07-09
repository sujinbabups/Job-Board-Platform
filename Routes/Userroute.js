const express = require("express");
const router = express.Router();
const User = require("../Models/candidate_reg");

const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

//user registration

router.post('/can-reg', async (req, res) => {
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

router.post('/canLogin', async (req, res) => {
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
