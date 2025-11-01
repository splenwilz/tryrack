import { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface WardrobeFilters {
  searchQuery: string;
  status: 'all' | 'clean' | 'worn' | 'dirty';
  category: string | null;  // null = all categories
  color: string | null;  // null = all colors
  tag: string | null;  // null = all tags
  lastWornFilter: 'all' | 'never' | 'recent' | 'old';  // never, recent (30 days), old (30+ days)
}

interface WardrobeFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: WardrobeFilters;
  onApplyFilters: (filters: WardrobeFilters) => void;
  availableCategories: string[];
  availableColors: string[];
  availableTags: string[];
}

/**
 * Wardrobe Filter Modal Component
 * Allows users to filter wardrobe items by search query, status, category, color, tags, and last worn date
 */
export const WardrobeFilterModal: React.FC<WardrobeFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  availableCategories,
  availableColors,
  availableTags,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  
  const [localFilters, setLocalFilters] = useState<WardrobeFilters>(filters);

  // Sync local filters when modal opens or filters prop changes
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: WardrobeFilters = {
      searchQuery: '',
      status: 'all',
      category: null,
      color: null,
      tag: null,
      lastWornFilter: 'all',
    };
    setLocalFilters(resetFilters);
  };

  const hasActiveFilters = localFilters.searchQuery !== '' ||
    localFilters.status !== 'all' ||
    localFilters.category !== null ||
    localFilters.color !== null ||
    localFilters.tag !== null ||
    localFilters.lastWornFilter !== 'all';

  const statusOptions = [
    { key: 'all' as const, label: 'All Statuses' },
    { key: 'clean' as const, label: 'Clean' },
    { key: 'worn' as const, label: 'Worn' },
    { key: 'dirty' as const, label: 'Dirty' },
  ];

  const lastWornOptions = [
    { key: 'all' as const, label: 'All Items' },
    { key: 'never' as const, label: 'Never Worn' },
    { key: 'recent' as const, label: 'Worn Recently (30 days)' },
    { key: 'old' as const, label: 'Not Worn in 30+ Days' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.modalTitle}>Filter Wardrobe</ThemedText>
          <TouchableOpacity onPress={handleApply}>
            <ThemedText style={[styles.modalApplyText, { color: tintColor }]}>Apply</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Search Input */}
          <View style={styles.searchSection}>
            <View style={[styles.searchBar, { borderColor, backgroundColor }]}>
              <IconSymbol name="magnifyingglass" size={20} color={textColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search by item name..."
                placeholderTextColor={borderColor}
                value={localFilters.searchQuery}
                onChangeText={(text) => setLocalFilters({ ...localFilters, searchQuery: text })}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {localFilters.searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setLocalFilters({ ...localFilters, searchQuery: '' })}>
                  <IconSymbol name="xmark.circle.fill" size={20} color={borderColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <ThemedText type="subtitle" style={styles.filterSectionTitle}>Status</ThemedText>
            <View style={styles.chipContainer}>
              {statusOptions.map((option) => {
                const isSelected = localFilters.status === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterChip,
                      { borderColor, backgroundColor },
                      isSelected && { backgroundColor: tintColor, borderColor: tintColor },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, status: option.key })}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        { color: isSelected ? 'white' : textColor },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <View style={styles.filterSection}>
              <ThemedText type="subtitle" style={styles.filterSectionTitle}>Category</ThemedText>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { borderColor, backgroundColor },
                    localFilters.category === null && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, category: null })}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      { color: localFilters.category === null ? 'white' : textColor },
                    ]}
                  >
                    All Categories
                  </ThemedText>
                </TouchableOpacity>
                {availableCategories.map((category) => {
                  const isSelected = localFilters.category === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterChip,
                        { borderColor, backgroundColor },
                        isSelected && { backgroundColor: tintColor, borderColor: tintColor },
                      ]}
                      onPress={() => setLocalFilters({
                        ...localFilters,
                        category: isSelected ? null : category,
                      })}
                    >
                      <ThemedText
                        style={[
                          styles.filterChipText,
                          { color: isSelected ? 'white' : textColor },
                        ]}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Color Filter */}
          {availableColors.length > 0 && (
            <View style={styles.filterSection}>
              <ThemedText type="subtitle" style={styles.filterSectionTitle}>Color</ThemedText>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { borderColor, backgroundColor },
                    localFilters.color === null && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, color: null })}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      { color: localFilters.color === null ? 'white' : textColor },
                    ]}
                  >
                    All Colors
                  </ThemedText>
                </TouchableOpacity>
                {availableColors.slice(0, 12).map((color) => {
                  const isSelected = localFilters.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.filterChip,
                        { borderColor, backgroundColor },
                        isSelected && { backgroundColor: tintColor, borderColor: tintColor },
                      ]}
                      onPress={() => setLocalFilters({
                        ...localFilters,
                        color: isSelected ? null : color,
                      })}
                    >
                      <ThemedText
                        style={[
                          styles.filterChipText,
                          { color: isSelected ? 'white' : textColor },
                        ]}
                      >
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <View style={styles.filterSection}>
              <ThemedText type="subtitle" style={styles.filterSectionTitle}>Style Tags</ThemedText>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { borderColor, backgroundColor },
                    localFilters.tag === null && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, tag: null })}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      { color: localFilters.tag === null ? 'white' : textColor },
                    ]}
                  >
                    All Tags
                  </ThemedText>
                </TouchableOpacity>
                {availableTags.slice(0, 10).map((tag) => {
                  const isSelected = localFilters.tag === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.filterChip,
                        { borderColor, backgroundColor },
                        isSelected && { backgroundColor: tintColor, borderColor: tintColor },
                      ]}
                      onPress={() => setLocalFilters({
                        ...localFilters,
                        tag: isSelected ? null : tag,
                      })}
                    >
                      <ThemedText
                        style={[
                          styles.filterChipText,
                          { color: isSelected ? 'white' : textColor },
                        ]}
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Last Worn Filter */}
          <View style={styles.filterSection}>
            <ThemedText type="subtitle" style={styles.filterSectionTitle}>Last Worn</ThemedText>
            <View style={styles.optionList}>
              {lastWornOptions.map((option) => {
                const isSelected = localFilters.lastWornFilter === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      { borderColor, backgroundColor },
                      isSelected && styles.filterOptionSelected,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, lastWornFilter: option.key })}
                  >
                    <ThemedText style={styles.filterOptionText}>{option.label}</ThemedText>
                    {isSelected && (
                      <IconSymbol name="checkmark" size={20} color={tintColor} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor }]}
            onPress={handleReset}
            disabled={!hasActiveFilters}
          >
            <ThemedText
              style={[
                styles.resetButtonText,
                { color: hasActiveFilters ? textColor : borderColor },
              ]}
            >
              Reset Filters
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: tintColor }]}
            onPress={handleApply}
          >
            <ThemedText style={styles.applyButtonText}>
              Apply Filters
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancelText: {
    fontSize: 16,
    opacity: 0.7,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionList: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterOptionSelected: {
    borderWidth: 2,
  },
  filterOptionText: {
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

