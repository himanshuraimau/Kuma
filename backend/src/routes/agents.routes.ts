import { Router } from 'express';
import * as agentsController from '../controllers/agents.controller';

const router = Router();

// Get all agents
router.get('/', agentsController.getAgents);

// Get specific agent
router.get('/:name', agentsController.getAgent);

export default router;
