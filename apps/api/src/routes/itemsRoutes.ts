import express from 'express';
import { itemController } from '../controllers/itemController';

const router = express.Router();

router.get('/', itemController.getItems);
router.patch('/', itemController.updateItem);
router.post('/rerange', itemController.rerangeItems);
router.post('/resize', itemController.resizeItems);

export default router;
