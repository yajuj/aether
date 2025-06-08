import express from 'express';
import itemRouter from './itemsRoutes';

export const router = express.Router();

router
	.use('/items', itemRouter)
	.use(
		(
			err: Error,
			req: express.Request,
			res: express.Response,
			next: express.NextFunction
		) => {
			console.error(err.stack);
			res.status(500).json({ error: 'Something went wrong!' });
		}
	);

export default router;
