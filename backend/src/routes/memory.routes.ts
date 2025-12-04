import { Router } from 'express';
import { authMiddleware } from '../lib/middleware';
import * as memoryController from '../controllers/memory.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Add a new memory
router.post('/', memoryController.addMemory);

// Search memories
router.get('/search', memoryController.searchMemories);

// Get relevant context (for agent use)
router.post('/context', memoryController.getRelevantContext);

// List all memories
router.get('/', memoryController.listMemories);

// Get a specific memory
router.get('/:id', memoryController.getMemory);

// Update a memory
router.put('/:id', memoryController.updateMemory);

// Delete a memory
router.delete('/:id', memoryController.deleteMemory);

export default router;
