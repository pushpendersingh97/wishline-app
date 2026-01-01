import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { categoryService, type Category } from '@/lib/services/categoryService';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    parentCategoryName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundCard');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = Colors[colorScheme].error;

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = () => {
    setFormData({ categoryName: '', parentCategoryName: '' });
    setEditingCategory(null);
    setShowAddModal(true);
    setError(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      categoryName: category.categoryName,
      parentCategoryName:
        category.parentCategoryName === 'NA' ? '' : category.parentCategoryName,
    });
    setEditingCategory(category);
    setShowAddModal(true);
    setError(null);
  };

  const handleDelete = async (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setError(null);
              await categoryService.deleteCategory(categoryId);
              await loadCategories();
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : 'Failed to delete category';
              setError(errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, {
          categoryName: formData.categoryName,
        });
      } else {
        await categoryService.createCategory({
          categoryName: formData.categoryName,
          parentCategoryName: formData.parentCategoryName || undefined,
        });
      }
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({ categoryName: '', parentCategoryName: '' });
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Categories
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: textMuted }]}>
              Manage your task categories
            </ThemedText>
          </View>
          <Button onPress={handleAdd} style={styles.addButton}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <ThemedText style={styles.addButtonText}>Add Category</ThemedText>
          </Button>
        </View>

        {/* Error Message */}
        {error && !showAddModal && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(220, 38, 38, 0.1)',
              },
            ]}
          >
            <ThemedText style={[styles.errorText, { color: errorColor }]}>
              {error}
            </ThemedText>
          </View>
        )}

        {/* Categories List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={[styles.loadingText, { color: textMuted }]}>
              Loading categories...
            </ThemedText>
          </View>
        ) : categories.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: cardBackground }]}>
            <Ionicons name="folder-outline" size={48} color={textMuted} />
            <ThemedText style={[styles.emptyStateText, { color: textColor }]}>
              No categories yet
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtext, { color: textMuted }]}>
              Create your first category to get started
            </ThemedText>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <View
                key={category._id}
                style={[styles.categoryCard, { backgroundColor: cardBackground }]}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryInfo}>
                    <ThemedText style={[styles.categoryName, { color: textColor }]}>
                      {category.categoryName}
                    </ThemedText>
                    {category.parentCategoryName !== 'NA' && (
                      <ThemedText style={[styles.parentCategory, { color: textMuted }]}>
                        Parent: {category.parentCategoryName}
                      </ThemedText>
                    )}
                    <ThemedText style={[styles.categoryDate, { color: textMuted }]}>
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(category)}
                      style={[styles.actionButton, { backgroundColor: cardBackground }]}
                    >
                      <Ionicons name="pencil" size={16} color={textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(category._id)}
                      style={[styles.actionButton, { backgroundColor: cardBackground }]}
                    >
                      <Ionicons name="trash-outline" size={16} color={errorColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
          setFormData({ categoryName: '', parentCategoryName: '' });
          setError(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setFormData({ categoryName: '', parentCategoryName: '' });
                  setError(null);
                }}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {error && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(220, 38, 38, 0.1)',
                  },
                ]}
              >
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {error}
                </ThemedText>
              </View>
            )}

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Category Name <ThemedText style={{ color: errorColor }}>*</ThemedText>
                </ThemedText>
                <Input
                  placeholder="Enter category name"
                  value={formData.categoryName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, categoryName: text })
                  }
                />
              </View>

              {!editingCategory && (
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.label, { color: textColor }]}>
                    Parent Category (Optional)
                  </ThemedText>
                  <Input
                    placeholder="Enter parent category name"
                    value={formData.parentCategoryName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, parentCategoryName: text })
                    }
                  />
                </View>
              )}

              <View style={styles.modalButtons}>
                <Button
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setFormData({ categoryName: '', parentCategoryName: '' });
                    setError(null);
                  }}
                  variant="outline"
                  style={styles.modalButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit}
                  style={styles.modalButton}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingCategory
                      ? 'Update'
                      : 'Create'}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  categoriesGrid: {
    gap: 16,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 20,
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  categoryDate: {
    fontSize: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});

