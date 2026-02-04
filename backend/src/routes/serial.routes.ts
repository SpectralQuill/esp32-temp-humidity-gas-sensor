import { Router } from 'express';
import { body, query } from 'express-validator';
import { SerialController } from '../controllers/serial.controller';

const router = Router();

// Validation middleware
const validateCommand = [
  body('command').isString().notEmpty(),
  body('params').optional().isArray(),
];

const validateWrite = [
  body('data').isString().notEmpty(),
];

// Routes
router.get('/status', SerialController.getStatus);
router.post('/initialize', SerialController.initialize);
router.post('/write', validateWrite, SerialController.writeData);
router.post('/command', validateCommand, SerialController.sendCommand);
router.post('/close', SerialController.close);

export default router;
