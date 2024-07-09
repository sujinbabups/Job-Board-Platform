const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
    co_name: { type: String, required: true },
    co_type: { type: String, required: true },
    place: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});

const Employer = mongoose.model('Employer', employerSchema);

module.exports = Employer;

