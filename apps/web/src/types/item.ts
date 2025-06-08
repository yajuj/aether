export interface Item {
	id: number;
	title: string;
	value: number;
	selected: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
