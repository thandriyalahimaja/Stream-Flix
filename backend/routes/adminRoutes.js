import { Router } from 'express';
import { getDashboard, getUsers, updateUserRole, deleteUser, exportSeed, getDataQuality } from '../controllers/adminController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', auth, adminOnly, getDashboard);
router.get('/users', auth, adminOnly, getUsers);
router.put('/users/:id/role', auth, adminOnly, updateUserRole);
router.delete('/users/:id', auth, adminOnly, deleteUser);
router.get('/export-seed', auth, adminOnly, exportSeed);
router.get('/data-quality', auth, adminOnly, getDataQuality);

export default router;
