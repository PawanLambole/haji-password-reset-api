const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/', (req, res) => {
  res.send('Haji Fitness Password Reset API');
});

app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  try {
    // 1. Get user ID from email using RPC
    const { data: userId, error: rpcError } = await supabase.rpc(
      'get_user_id_by_email',
      { _email: email }
    );

    if (rpcError || !userId) {
      console.error('RPC error:', rpcError?.message);
      return res.status(404).json({ error: 'User not found.' });
    }

    // 2. Update the password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Password update failed:', updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Unexpected server error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
