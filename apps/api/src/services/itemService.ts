interface Item {
	title: string;
	id: number;
	value: number;
	selected: boolean;
}

export const MAX_ITEMS_LENGTH = 1_000_000;

let items: Item[] = Array.from({ length: MAX_ITEMS_LENGTH }, (_, i) => ({
	id: i,
	title: `Item ${i}`,
	value: 100,
	selected: false,
}));

let itemsCopy: Item[] = Array.from(items);

export const itemService = {
	getItems(page: number = 1, pageSize: number = 20, search?: string) {
		let filteredItems = items;

		if (search) {
			filteredItems = items.filter(item =>
				item.title.toLowerCase().includes(search.toLowerCase())
			);
		}

		const total = filteredItems.length;
		const totalPages = Math.ceil(total / pageSize);
		const start = (page - 1) * pageSize;
		const end = start + pageSize;

		return {
			data: filteredItems.slice(start, end),
			total,
			page,
			pageSize,
			totalPages,
		};
	},

	updateItem(id: number, updates: Partial<Item>) {
		const index = items.findIndex(item => item.id === id);
		if (index === -1) return null;

		items[index] = { ...items[index], ...updates };
		return items[index];
	},

	rerangeItems(itemIds: [number, number, number]): boolean {
		if (!Array.isArray(itemIds) || itemIds.length !== 3) return false;

		const [movedItemId, afterItemId, beforeItemId] = itemIds;

		const validIds = new Set(items.map(item => item.id));
		if (!validIds.has(movedItemId)) return false;

		const movedItemIndex = items.findIndex(item => item.id === movedItemId);
		const movedItem = items[movedItemIndex];

		items.splice(movedItemIndex, 1);

		if (afterItemId === null) {
			const beforeItemIndex = items.findIndex(item => item.id === beforeItemId);
			if (beforeItemIndex === 0) {
				items.unshift(movedItem);
			} else {
				if (beforeItemIndex === -1) return false;
				items.splice(beforeItemIndex, 0, movedItem);
			}
		} else {
			const afterItemIndex = items.findIndex(item => item.id === afterItemId);
			if (afterItemIndex === -1) return false;

			items.splice(afterItemIndex + 1, 0, movedItem);
		}

		return true;
	},

	resizeItems(size: number): boolean {
		if (size < items.length) {
			itemsCopy.splice(size);

			itemsCopy = itemsCopy.concat(items.splice(size));
		} else {
			items = itemsCopy.slice(0, size);
		}
		console.log(itemsCopy.length);
		return true;
	},
};
