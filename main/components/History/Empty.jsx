import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ currentTheme, isFilterActive, textLine1, textLine2 }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyState}>
      <Text
        style={[
          styles.emptyStateText,
          { color: currentTheme.placeholderColor },
        ]}
      >
        {isFilterActive
          ? t('component_empty_for_range_title')
          : textLine1 ?? t('component_empty_title')}
      </Text>
      <Text
        style={[
          styles.emptyStateSubtext,
          { color: currentTheme.placeholderColor },
        ]}
      >
        {isFilterActive
          ? t('component_empty_for_range_sub')
          : textLine2 ?? t('component_empty_sub')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default EmptyState;