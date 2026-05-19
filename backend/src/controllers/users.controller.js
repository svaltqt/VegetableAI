import { getUserProfile, updateUserProfile, deleteUserProfile, uploadUserAvatar } from '../services/users.service.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await updateUserProfile(req.user.id, req.body);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccountData = async (req, res) => {
  try {
    await deleteUserProfile(req.user.id);
    res.json({ success: true, message: 'Perfil borrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo de imagen.' });
    }
    const profile = await uploadUserAvatar(req.user.id, req.file);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
