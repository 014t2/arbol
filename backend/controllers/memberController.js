const db = require('../config/db'); // Database connection pool

// Create a new family member
const createMember = async (req, res) => {
  const { name, date_of_birth, gender, photo_url, bio } = req.body;
  const user_id = req.user.id; // Assumed to be set by auth middleware

  if (!name) {
    return res.status(400).json({ message: 'Name is a required field.' });
  }
  if (!user_id) {
    // This should ideally be caught by auth middleware, but good to have a fallback
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO family_members (user_id, name, date_of_birth, gender, photo_url, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, date_of_birth || null, gender || null, photo_url || null, bio || null]
    );
    const newMemberId = result.insertId;
    const [newMember] = await db.query('SELECT * FROM family_members WHERE id = ?', [newMemberId]);

    res.status(201).json({ message: 'Family member created successfully.', member: newMember[0] });
  } catch (error) {
    console.error('Error creating family member:', error);
    res.status(500).json({ message: 'Server error while creating family member.', error: error.message });
  }
};

// Get all family members for the logged-in user
const getMembers = async (req, res) => {
  const user_id = req.user.id; // Assumed to be set by auth middleware

  if (!user_id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const [members] = await db.query('SELECT * FROM family_members WHERE user_id = ?', [user_id]);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ message: 'Server error while fetching family members.', error: error.message });
  }
};

// Get a specific family member by ID
const getMemberById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id; // Assumed to be set by auth middleware

  if (!user_id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const [member] = await db.query(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (member.length === 0) {
      return res.status(404).json({ message: 'Family member not found or not authorized.' });
    }
    res.status(200).json(member[0]);
  } catch (error) {
    console.error('Error fetching family member by ID:', error);
    res.status(500).json({ message: 'Server error while fetching family member.', error: error.message });
  }
};

// Update a specific family member by ID
const updateMember = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id; // Assumed to be set by auth middleware
  const { name, date_of_birth, gender, photo_url, bio } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  // Ensure at least one field is being updated, or name is present if that's the only update
  if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No update data provided.' });
  }
  if (req.body.hasOwnProperty('name') && !name) {
      return res.status(400).json({ message: 'Name cannot be empty if provided for update.' });
  }


  try {
    // First, verify the member exists and belongs to the user
    const [existingMember] = await db.query(
      'SELECT * FROM family_members WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existingMember.length === 0) {
      return res.status(404).json({ message: 'Family member not found or not authorized to update.' });
    }

    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      queryParams.push(name);
    }
    if (date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?');
      queryParams.push(date_of_birth || null);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      queryParams.push(gender || null);
    }
    if (photo_url !== undefined) {
      updateFields.push('photo_url = ?');
      queryParams.push(photo_url || null);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      queryParams.push(bio || null);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    queryParams.push(id); // For WHERE id = ?
    queryParams.push(user_id); // For WHERE user_id = ?

    const updateQuery = `UPDATE family_members SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;

    const [result] = await db.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      // Should be caught by the initial check, but as a safeguard
      return res.status(404).json({ message: 'Family member not found or not authorized to update (update failed).' });
    }

    const [updatedMember] = await db.query('SELECT * FROM family_members WHERE id = ?', [id]);
    res.status(200).json({ message: 'Family member updated successfully.', member: updatedMember[0] });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ message: 'Server error while updating family member.', error: error.message });
  }
};

// Delete a specific family member by ID
const deleteMember = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id; // Assumed to be set by auth middleware

  if (!user_id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM family_members WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Family member not found or not authorized to delete.' });
    }
    res.status(200).json({ message: 'Family member deleted successfully.' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ message: 'Server error while deleting family member.', error: error.message });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
