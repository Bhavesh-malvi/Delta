import express from 'express';
import { createContact, getAllContacts, deleteContact } from '../Controllers/contactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', getAllContacts);
router.delete('/:id', deleteContact);

export default router; 