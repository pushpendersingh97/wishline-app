import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { taskService, type SubTask, type Task } from '@/lib/services/taskService';
import { categoryService } from '@/lib/services/categoryService';
import { convertPriorityToBackend, convertStatusToBackend, convertPriorityToFrontend, convertStatusToFrontend } from '@/lib/utils/taskUtils';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingWish?: Task | null;
}

export function AddWishModal({ isOpen, onClose, onSuccess, editingWish }: AddWishModalProps) {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundCard');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = Colors[colorScheme].primary;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Health',
    priority: 'High' as 'High' | 'Medium' | 'Low',
    targetDate: '',
    status: 'In Progress' as 'Not Started' | 'In Progress' | 'Completed',
  });

  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        const categoryNames = cats.map((cat) => cat.categoryName);
        setCategories(categoryNames);
        if (categoryNames.length > 0 && formData.category === 'Health' && !categoryNames.includes('Health')) {
          setFormData((prev) => ({ ...prev, category: categoryNames[0] }));
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        // Fallback categories
        setCategories(['Health', 'Career', 'Personal', 'Travel']);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Load editing wish data
  useEffect(() => {
    if (isOpen) {
      if (editingWish) {
        const targetDate = editingWish.targetDate
          ? new Date(editingWish.targetDate).toISOString().split('T')[0]
          : '';
        setFormData({
          title: editingWish.title,
          description: editingWish.description || '',
          category: editingWish.category,
          priority: convertPriorityToFrontend(editingWish.priority),
          targetDate: targetDate,
          status: convertStatusToFrontend(editingWish.status),
        });
        setSubTasks(editingWish.subTasks || []);
      } else {
        setFormData({
          title: '',
          description: '',
          category: 'Health',
          priority: 'High',
          targetDate: '',
          status: 'In Progress',
        });
        setSubTasks([]);
      }
      setError(null);
    }
  }, [editingWish, isOpen]);

  const priorities = [
    { value: 'High' as const, label: 'High' },
    { value: 'Medium' as const, label: 'Medium' },
    { value: 'Low' as const, label: 'Low' },
  ];

  const statuses = [
    { value: 'Not Started' as const, label: 'Not Started' },
    { value: 'In Progress' as const, label: 'In Progress' },
    { value: 'Completed' as const, label: 'Completed' },
  ];

  const addSubTask = () => {
    setSubTasks([...subTasks, { description: '', isCompleted: false }]);
  };

  const removeSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const updateSubTask = (index: number, field: keyof SubTask, value: string | boolean) => {
    const updated = [...subTasks];
    updated[index] = { ...updated[index], [field]: value };
    setSubTasks(updated);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.targetDate) {
      setError('Target date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert date to ISO string format
      const targetDateISO = new Date(formData.targetDate).toISOString();

      // Filter out empty subtasks
      const validSubTasks = subTasks
        .filter((st) => st.description.trim() !== '')
        .map((st) => ({
          description: st.description.trim(),
          isCompleted: st.isCompleted,
        }));

      if (editingWish) {
        await taskService.updateTask(editingWish._id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: convertPriorityToBackend(formData.priority),
          targetDate: targetDateISO,
          status: convertStatusToBackend(formData.status),
          subTasks: validSubTasks,
        });
      } else {
        await taskService.createTask({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: convertPriorityToBackend(formData.priority),
          targetDate: targetDateISO,
          status: convertStatusToBackend(formData.status),
          subTasks: validSubTasks,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save wish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <ThemedView style={[styles.modalContent, { backgroundColor: cardBackground }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>
              {editingWish ? 'Edit Wish' : 'Add New Wish'}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: Colors[colorScheme].error + '20' }]}>
                <ThemedText style={[styles.errorText, { color: Colors[colorScheme].error }]}>
                  {error}
                </ThemedText>
              </View>
            )}

            {/* Title */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Title <Text style={{ color: Colors[colorScheme].error }}>*</Text>
              </ThemedText>
              <Input
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter wish title"
                style={styles.input}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Description <Text style={{ color: Colors[colorScheme].error }}>*</Text>
              </ThemedText>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter description"
                placeholderTextColor={textMuted}
                multiline
                numberOfLines={3}
                style={[
                  styles.textArea,
                  {
                    color: textColor,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                  },
                ]}
              />
            </View>

            {/* Category and Priority */}
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <ThemedText style={[styles.label, { color: textColor }]}>Category</ThemedText>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(true)}
                  style={[
                    styles.pickerButton,
                    { backgroundColor: backgroundColor, borderColor: borderColor },
                  ]}
                >
                  <ThemedText style={[styles.pickerText, { color: textColor }]}>
                    {formData.category || 'Select Category'}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={20} color={textColor} />
                </TouchableOpacity>
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <ThemedText style={[styles.label, { color: textColor }]}>Priority</ThemedText>
                <TouchableOpacity
                  onPress={() => setShowPriorityPicker(true)}
                  style={[
                    styles.pickerButton,
                    { backgroundColor: backgroundColor, borderColor: borderColor },
                  ]}
                >
                  <ThemedText style={[styles.pickerText, { color: textColor }]}>
                    {priorities.find((p) => p.value === formData.priority)?.label || 'Select Priority'}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={20} color={textColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Target Date */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Target Date <Text style={{ color: Colors[colorScheme].error }}>*</Text>
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.pickerButton,
                  { backgroundColor: backgroundColor, borderColor: borderColor },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color={textColor} />
                <ThemedText style={[styles.pickerText, { color: textColor, marginLeft: 8 }]}>
                  {formData.targetDate ? formatDate(formData.targetDate) : 'Select date'}
                </ThemedText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.targetDate ? new Date(formData.targetDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (event.type === 'set' && selectedDate) {
                      const dateString = selectedDate.toISOString().split('T')[0];
                      setFormData({ ...formData, targetDate: dateString });
                    } else if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                  }}
                />
              )}
              {Platform.OS === 'ios' && showDatePicker && (
                <View style={[styles.datePickerActions, { borderTopColor: borderColor }]}>
                  <Button
                    onPress={() => setShowDatePicker(false)}
                    variant="outline"
                    style={styles.datePickerButton}
                  >
                    <ThemedText style={{ color: primaryColor }}>Done</ThemedText>
                  </Button>
                </View>
              )}
            </View>

            {/* Subtasks */}
            <View style={styles.formGroup}>
              <View style={styles.subtaskHeader}>
                <ThemedText style={[styles.label, { color: textColor }]}>Subtasks</ThemedText>
                <Button
                  onPress={addSubTask}
                  variant="outline"
                  style={styles.addSubtaskButton}
                  disabled={isSubmitting}
                >
                  <Ionicons name="add" size={16} color={primaryColor} />
                  <ThemedText style={[styles.addSubtaskText, { color: primaryColor }]}>
                    Add Subtask
                  </ThemedText>
                </Button>
              </View>
              {subTasks.length > 0 && (
                <View style={[styles.subtasksContainer, { borderColor: borderColor }]}>
                  {subTasks.map((subTask, index) => (
                    <View key={index} style={styles.subtaskItem}>
                      <TouchableOpacity
                        onPress={() =>
                          updateSubTask(index, 'isCompleted', !subTask.isCompleted)
                        }
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: subTask.isCompleted ? primaryColor : 'transparent',
                            borderColor: borderColor,
                          },
                        ]}
                      >
                        {subTask.isCompleted && (
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                        )}
                      </TouchableOpacity>
                      <Input
                        value={subTask.description}
                        onChangeText={(text) => updateSubTask(index, 'description', text)}
                        placeholder="Enter subtask description"
                        style={[styles.subtaskInput, { flex: 1 }]}
                      />
                      <TouchableOpacity
                        onPress={() => removeSubTask(index)}
                        style={styles.removeSubtaskButton}
                        disabled={isSubmitting}
                      >
                        <Ionicons name="close" size={20} color={Colors[colorScheme].error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {subTasks.length === 0 && (
                <ThemedText style={[styles.emptySubtaskText, { color: textMuted }]}>
                  No subtasks added. Click "Add Subtask" to break down your wish into smaller steps.
                </ThemedText>
              )}
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>Status</ThemedText>
              <View style={styles.statusContainer}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    onPress={() => setFormData({ ...formData, status: status.value })}
                    style={[
                      styles.statusOption,
                      {
                        backgroundColor:
                          formData.status === status.value ? primaryColor + '20' : backgroundColor,
                        borderColor: formData.status === status.value ? primaryColor : borderColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        {
                          borderColor:
                            formData.status === status.value ? primaryColor : borderColor,
                        },
                      ]}
                    >
                      {formData.status === status.value && (
                        <View
                          style={[styles.radioButtonInner, { backgroundColor: primaryColor }]}
                        />
                      )}
                    </View>
                    <ThemedText style={[styles.statusText, { color: textColor }]}>
                      {status.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                onPress={onClose}
                variant="outline"
                style={[styles.actionButton, { flex: 1 }]}
                disabled={isSubmitting}
              >
                <ThemedText style={[styles.actionButtonText, { color: primaryColor }]}>
                  Cancel
                </ThemedText>
              </Button>
              <Button
                onPress={handleSubmit}
                style={[styles.actionButton, { flex: 1, backgroundColor: primaryColor }]}
                disabled={isSubmitting}
              >
                <ThemedText style={[styles.actionButtonText, { color: '#ffffff' }]}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </ThemedText>
              </Button>
            </View>
          </ScrollView>

          {/* Category Picker Modal */}
          {showCategoryPicker && (
            <Modal
              visible={showCategoryPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowCategoryPicker(false)}
            >
              <View style={styles.pickerModalOverlay}>
                <ThemedView style={[styles.pickerModalContent, { backgroundColor: cardBackground }]}>
                  <View style={[styles.pickerHeader, { borderBottomColor: borderColor }]}>
                    <ThemedText style={[styles.pickerHeaderTitle, { color: textColor }]}>
                      Select Category
                    </ThemedText>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                      <Ionicons name="close" size={24} color={textColor} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => {
                          setFormData({ ...formData, category });
                          setShowCategoryPicker(false);
                        }}
                        style={[
                          styles.pickerOption,
                          {
                            backgroundColor:
                              formData.category === category ? primaryColor + '20' : backgroundColor,
                            borderBottomColor: borderColor,
                          },
                        ]}
                      >
                        <ThemedText style={[styles.pickerOptionText, { color: textColor }]}>
                          {category}
                        </ThemedText>
                        {formData.category === category && (
                          <Ionicons name="checkmark" size={20} color={primaryColor} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </ThemedView>
              </View>
            </Modal>
          )}

          {/* Priority Picker Modal */}
          {showPriorityPicker && (
            <Modal
              visible={showPriorityPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPriorityPicker(false)}
            >
              <View style={styles.pickerModalOverlay}>
                <ThemedView style={[styles.pickerModalContent, { backgroundColor: cardBackground }]}>
                  <View style={[styles.pickerHeader, { borderBottomColor: borderColor }]}>
                    <ThemedText style={[styles.pickerHeaderTitle, { color: textColor }]}>
                      Select Priority
                    </ThemedText>
                    <TouchableOpacity onPress={() => setShowPriorityPicker(false)}>
                      <Ionicons name="close" size={24} color={textColor} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {priorities.map((priority) => (
                      <TouchableOpacity
                        key={priority.value}
                        onPress={() => {
                          setFormData({ ...formData, priority: priority.value });
                          setShowPriorityPicker(false);
                        }}
                        style={[
                          styles.pickerOption,
                          {
                            backgroundColor:
                              formData.priority === priority.value ? primaryColor + '20' : backgroundColor,
                            borderBottomColor: borderColor,
                          },
                        ]}
                      >
                        <ThemedText style={[styles.pickerOptionText, { color: textColor }]}>
                          {priority.label}
                        </ThemedText>
                        {formData.priority === priority.value && (
                          <Ionicons name="checkmark" size={20} color={primaryColor} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </ThemedView>
              </View>
            </Modal>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addSubtaskText: {
    fontSize: 12,
    marginLeft: 4,
  },
  subtasksContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskInput: {
    marginBottom: 0,
  },
  removeSubtaskButton: {
    padding: 4,
  },
  emptySubtaskText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusContainer: {
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

