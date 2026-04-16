import { fetchCategories, getCategoryById, searchCategories } from '../categoryService';
import { http } from '../http';

// Mock the http service
jest.mock('../http', () => ({
  http: {
    get: jest.fn(),
  },
}));

describe('categoryService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCategories', () => {
    it('should return categories on successful fetch', async () => {
      const mockCategories = [{ _id: '1', name: 'Retro' }, { _id: '2', name: 'Classic' }];
      http.get.mockResolvedValue({ data: mockCategories });

      const categories = await fetchCategories();

      expect(http.get).toHaveBeenCalledWith('categories');
      expect(categories).toEqual(mockCategories);
    });

    it('should return an empty array on failure', async () => {
      http.get.mockRejectedValue(new Error('Network Error'));

      const categories = await fetchCategories();

      expect(categories).toEqual([]);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category when it exists', async () => {
      const mockCategory = { _id: '1', name: 'Retro' };
      http.get.mockResolvedValue({ data: mockCategory });

      const category = await getCategoryById('1');

      expect(http.get).toHaveBeenCalledWith('categories/1');
      expect(category).toEqual(mockCategory);
    });

    it('should return null when the category is not found or error occurs', async () => {
      http.get.mockRejectedValue({ response: { status: 404 } });

      const category = await getCategoryById('nonexistent');

      expect(category).toBeNull();
    });
  });

  describe('searchCategories', () => {
    it('should return search results with pagination', async () => {
      const mockData = {
        categories: [{ _id: '1', name: 'GBA' }],
        pagination: { totalPages: 1, currentPage: 1 }
      };
      http.get.mockResolvedValue({ data: mockData });

      const result = await searchCategories('gba');

      expect(http.get).toHaveBeenCalledWith('categories/search', { params: { q: 'gba' } });
      expect(result).toEqual(mockData);
    });
  });
});
