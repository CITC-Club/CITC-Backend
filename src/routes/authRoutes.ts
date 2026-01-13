import express from 'express';
import {  googleLogin, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);

export default router;
