const User = require('../model/User');

const findUserByEmail = (email) => User.findOne({ email });
const findUserById = (id) => User.findById(id).select('-password');
const createUser = (payload) => User.create(payload);
const listUsers = (filter = {}) => User.find(filter).select('-password').sort({ createdAt: -1 });

module.exports = { findUserByEmail, findUserById, createUser, listUsers };
