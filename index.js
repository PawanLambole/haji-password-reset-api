const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase admin client (privileged)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /update-password
app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  try {
    // 1. Find user by email
    const { data: user, error: findError } = await supabase.auth.admin.listUsers({
      email,
    });

    if (findError) {
      console.error('Error finding user:', findError.message);
      return res.status(500).json({ error: 'Failed to find user.' });
    }

    if (!user || user.users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = user.users[0].id;

    // 2. Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return res.status(500).json({ error: 'Failed to update password.' });
    }

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Password reset API running on port ${PORT}`);
});
