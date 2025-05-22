const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');

// Apply protect middleware to all routes in this file
// This ensures that a user must be authenticated to access any of these routes.
router.use(protect);

// @route   POST api/members
// @desc    Create a new family member
// @access  Private
router.post('/', createMember);

// @route   GET api/members
// @desc    Get all family members for the logged-in user
// @access  Private
router.get('/', getMembers);

// @route   GET api/members/:id
// @desc    Get a specific family member by ID
// @access  Private
router.get('/:id', getMemberById);

// @route   PUT api/members/:id
// @desc    Update a specific family member by ID
// @access  Private
router.put('/:id', updateMember);

// @route   DELETE api/members/:id
// @desc    Delete a specific family member by ID
// @access  Private
router.delete('/:id', deleteMember);

module.exports = router;
