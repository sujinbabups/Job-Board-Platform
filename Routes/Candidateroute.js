const express = require("express");
const router = express.Router();
const User = require("../Models/Employer");

const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");