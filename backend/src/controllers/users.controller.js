import { getUserProfile, updateUserProfile, deleteUserProfile } from '../services/users.service.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await updateUserProfile(req.user.id, req.body);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccountData = async (req, res) => {
  try {
    await deleteUserProfile(req.user.id);
    res.json({ success: true, message: 'Perfil borrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
