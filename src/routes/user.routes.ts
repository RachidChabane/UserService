import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateJwt, syncUserMiddleware, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateUserSchema } from '../validations/user.validation';

const router = Router();


// Protected routes that require authentication
router.use(validateJwt);
router.use(syncUserMiddleware);

// @ts-ignore
router.get('/me', userController.getCurrentUser);

// @ts-ignore
router.put('/me', validate(updateUserSchema), userController.updateCurrentUser);

// @ts-ignore
router.get('/', requireAdmin, userController.listUsers);

// @ts-ignore
router.get('/:id', requireAdmin, userController.getUserById);

export default router;