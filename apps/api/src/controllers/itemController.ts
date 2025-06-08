import { Request, Response } from 'express';
import { itemService } from '../services/itemService';
import { STATUS_CODES } from 'http';

export const itemController = {
	getItems(req: Request, res: Response) {
		const page = parseInt(req.query.page as string) || 1;
		const search = req.query.search as string;

		const result = itemService.getItems(page, 20, search);
		res.json(result);
	},

	updateItem(req: Request, res: Response) {
		const { id, ...updates } = req.body;
		if (id === undefined) {
			return res.status(400).json({ error: 'Item ID is required' });
		}

		const updatedItem = itemService.updateItem(id, updates);

		if (!updatedItem) {
			return res.status(404).json({ error: 'Item not found' });
		}

		res.json(updatedItem);
	},

	rerangeItems(req: Request, res: Response) {
		const { itemIds } = req.body;

		if (!Array.isArray(itemIds)) {
			return res.status(400).json({ error: 'itemIds must be an array' });
		}

		const success = itemService.rerangeItems(
			itemIds as [number, number, number]
		);

		if (!success) {
			return res.status(400).json({ error: 'Invalid item IDs provided' });
		}

		res.json({ success: true });
	},

	resizeItems(req: Request, res: Response) {
		const { size } = req.body;

		if (size < 0 || size > 1_000_000) {
			return res.status(400).json({
				error: 'Items size must be positive number under 1m inclusive',
			});
		}

		itemService.resizeItems(size);

		res.json({ success: true });
	},
};
