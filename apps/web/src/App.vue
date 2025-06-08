<template>
	<v-app>
		<v-app-bar color="primary">
			<v-app-bar-title>Items Manager</v-app-bar-title>
		</v-app-bar>

		<v-main>
			<v-container>
				<v-row>
					<v-col cols="12">
						<v-text-field
							v-model="search"
							label="Search items"
							prepend-icon="mdi-magnify"
							clearable
							@update:model-value="handleSearch"
						></v-text-field>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-card>
							<v-card-text>
								<div class="table-header">
									<div style="width: 5%"></div>
									<div style="width: 10%">ID</div>
									<div style="width: 35%">Title</div>
									<div style="width: 35%">Value</div>
									<div style="width: 15%">Actions</div>
								</div>

								<div class="scroll-container" ref="scrollContainer">
									<draggable
										v-model="items"
										item-key="id"
										handle=".drag-handle"
										@end="handleDragEnd"
										:scroll="scrollContainer"
										:animation="200"
									>
										<template #item="{ element: item }">
											<div class="table-row">
												<div style="width: 5%" class="drag-handle">
													<v-icon size="small" color="grey">mdi-drag</v-icon>
												</div>
												<div style="width: 10%">{{ item.id }}</div>
												<div style="width: 35%">{{ item.title }}</div>
												<div style="width: 35%">{{ item.value }}</div>
												<div style="width: 15%">
													<v-btn
														icon
														variant="text"
														size="small"
														@click="toggleItemSelection(item)"
													>
														<v-icon>
															{{
																item.selected
																	? 'mdi-checkbox-marked'
																	: 'mdi-checkbox-blank-outline'
															}}
														</v-icon>
													</v-btn>
												</div>
											</div>
										</template>
									</draggable>

									<div v-if="loading" class="text-center py-4">
										<v-progress-circular
											indeterminate
											color="primary"
										></v-progress-circular>
									</div>
								</div>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-container>
		</v-main>

		<v-snackbar v-model="showSnackbar" :color="snackbarColor">
			{{ snackbarText }}
		</v-snackbar>
	</v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { itemsApi } from './services/api';
import type { Item } from './types/item';
import draggable from 'vuedraggable';

const search = ref('');
const page = ref(1);
const items = ref<Item[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const scrollContainer = ref<HTMLElement | null>(null);

const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const showNotification = (text: string, color: string = 'success') => {
	snackbarText.value = text;
	snackbarColor.value = color;
	showSnackbar.value = true;
};

const loadItems = async (isNewSearch: boolean = false) => {
	if (!hasMore.value || loading.value) return;

	loading.value = true;
	try {
		const response = await itemsApi.getItems(page.value, search.value);

		if (isNewSearch) {
			items.value = response.data;
		} else {
			items.value = items.value.concat(response.data);
		}

		hasMore.value = page.value < response.totalPages;
		if (hasMore.value) {
			page.value++;
		}
	} catch (error) {
		showNotification('Error loading items', 'error');
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	page.value = 1;
	hasMore.value = true;
	loadItems(true);
};

const handleDragEnd = async (evt: any) => {
	try {
		const { oldIndex, newIndex } = evt;

		if (oldIndex === newIndex) return;

		const movedItemId = items.value[newIndex].id;

		const afterItemId = items.value[newIndex - 1]?.id;

		const beforeItemId = items.value[newIndex + 1]?.id;

		await itemsApi.rerangeItems([movedItemId, afterItemId, beforeItemId]);
		showNotification('Items reordered successfully');
	} catch (error) {
		showNotification('Error reordering items', 'error');
	}
};

const toggleItemSelection = async (item: Item) => {
	try {
		const index = items.value.findIndex(i => i.id === item.id);

		if (index === -1) return;

		const updatedItem = await itemsApi.updateItem(item.id, {
			selected: !item.selected,
		});

		items.value[index] = updatedItem;
	} catch (error) {
		showNotification('Error updating item', 'error');
	}
};

let observer: IntersectionObserver | null = null;
let mutationObserver: MutationObserver | null = null;
onMounted(() => {
	loadItems();

	observer = new IntersectionObserver(
		entries => {
			if (entries[0].isIntersecting && !loading.value && hasMore.value) {
				loadItems();
			}
		},
		{
			root: scrollContainer.value,
			rootMargin: '150px',
		}
	);

	const observeLastItem = () => {
		const lastItem = document.querySelector('.table-row:last-child');

		if (lastItem && observer) {
			observer.disconnect();
			observer.observe(lastItem);
		}
	};

	mutationObserver = new MutationObserver(observeLastItem);
	if (scrollContainer.value) {
		mutationObserver.observe(scrollContainer.value, {
			childList: true,
			subtree: true,
		});
	}
});

onUnmounted(() => {
	observer?.disconnect();
	mutationObserver?.disconnect();
});
</script>

<style scoped>
.scroll-container {
	height: 500px;
	overflow-y: auto;
}

.table-header {
	display: flex;
	align-items: center;
	padding: 0 16px;
	height: 48px;
	font-weight: bold;
	border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
	background-color: rgb(var(--v-theme-surface));
	position: sticky;
	top: 0;
	z-index: 1;
}

.table-row {
	display: flex;
	align-items: center;
	padding: 0 16px;
	height: 48px;
	border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
	background-color: rgb(var(--v-theme-surface));
}

.table-row:hover {
	background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.drag-handle {
	cursor: move;
	display: flex;
	align-items: center;
	opacity: 0.5;
}

.drag-handle:hover {
	opacity: 1;
}
</style>
