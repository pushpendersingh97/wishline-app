import apiClient from '../apiClient';

export interface Category {
  _id: string;
  categoryName: string;
  parentCategoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  parentCategoryName?: string;
}

export interface UpdateCategoryRequest {
  categoryName: string;
}

export interface CategoryResponse {
  message: string;
  data: Category | Category[];
}

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<CategoryResponse>('/category');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<CategoryResponse>('/category', {
      ...data,
      parentCategoryName: data.parentCategoryName || 'NA',
    });
    return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
  },

  updateCategory: async (categoryId: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<CategoryResponse>(`/category/${categoryId}`, data);
    return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/category/${categoryId}`);
  },
};

