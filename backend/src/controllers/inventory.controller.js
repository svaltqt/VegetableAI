import { fetchAndProcessInventory, createProduct, editProduct, removeProduct } from '../services/inventory.service.js';

export const getInventory = async (req, res) => {
  try {
    const processedInventory = await fetchAndProcessInventory(req.user.id);
    res.json(processedInventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postProduct = async (req, res) => {
  try {
    const newProduct = await createProduct(req.user.id, req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const putProduct = async (req, res) => {
  try {
    const updatedProduct = await editProduct(req.user.id, req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await removeProduct(req.user.id, req.params.id);
    res.json({ success: true, deleted: deletedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
