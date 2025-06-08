import axios from 'axios';
import type { Item, PaginatedResponse } from '../types/item';

const api = axios.create({
	baseURL: '/api',
});

export const itemsApi = {
	async getItems(
		page: number = 1,
		search?: string
	): Promise<PaginatedResponse<Item>> {
		const params = new URLSearchParams([['page', page.toString()]]);

		if (search) params.append('search', search);

		const { data } = await api.get<PaginatedResponse<Item>>(`/items?${params}`);

		return data;
	},

	async updateItem(id: number, updates: Partial<Item>): Promise<Item> {
		const { data } = await api.patch<Item>('/items', { id, ...updates });
		return data;
	},

	async rerangeItems(
		itemIds: [number, number | null, number]
	): Promise<{ success: boolean }> {
		const { data } = await api.post('/items/rerange', { itemIds });
		return data;
	},
};
