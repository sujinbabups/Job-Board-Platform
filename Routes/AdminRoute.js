const express = require("express");
const router = express.Router();
const User = require("../Models/admin");

const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");