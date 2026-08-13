import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RuleEditModal = ({ visible, currentTheme, rule, onClose, onSave }) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [match, setMatch] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  useEffect(() => {
    if (visible && rule) {
      setTitle(rule.title ?? '');
      setMatch(rule.match ?? '');
      setReplace(rule.replace ?? '');
      setCaseSensitive(!!rule.caseSensitive);
      setUseRegex(!!rule.useRegex);
    }
  }, [visible, rule]);

  function handleModalOverlayPress() {
    onClose();
  }

  function handleSave() {
    onSave({
      ...rule,
      title,
      match,
      replace,
      caseSensitive,
      useRegex,
    });
  }

  const activeIconColor = 'white';
  const inactiveIconColor = currentTheme?.placeholderColor;

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleModalOverlayPress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.basContainer}>
              <ScrollView
                style={[
                  styles.modalContainer,
                  { backgroundColor: currentTheme?.backgroundColor },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: currentTheme?.textColor },
                    ]}
                  >
                    {t('component_rule_edit_header')}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Icon
                      name="close"
                      size={24}
                      color={currentTheme?.placeholderColor}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      {
                        borderColor: currentTheme?.borderColor,
                        backgroundColor: caseSensitive
                          ? currentTheme?.primaryColor
                          : 'transparent',
                      },
                    ]}
                    onPress={() => setCaseSensitive(!caseSensitive)}
                    accessibilityLabel={t('component_rule_edit_case_sensitive')}
                  >
                    <MCIcon
                      name="format-letter-case"
                      size={18}
                      color={
                        caseSensitive ? activeIconColor : inactiveIconColor
                      }
                    />
                    <Text
                      style={[
                        styles.toggleButtonText,
                        {
                          color: caseSensitive
                            ? activeIconColor
                            : currentTheme?.textColor,
                        },
                      ]}
                    >
                      {t('component_rule_edit_case_sensitive_label')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      {
                        borderColor: currentTheme?.borderColor,
                        backgroundColor: useRegex
                          ? currentTheme?.primaryColor
                          : 'transparent',
                      },
                    ]}
                    onPress={() => setUseRegex(!useRegex)}
                    accessibilityLabel={t('component_rule_edit_regex')}
                  >
                    <MCIcon
                      name="regex"
                      size={18}
                      color={useRegex ? activeIconColor : inactiveIconColor}
                    />
                    <Text
                      style={[
                        styles.toggleButtonText,
                        {
                          color: useRegex
                            ? activeIconColor
                            : currentTheme?.textColor,
                        },
                      ]}
                    >
                      {t('component_rule_edit_regex_label')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.fieldLabel,
                    { color: currentTheme?.textColor, marginTop: 16 },
                  ]}
                >
                  {t('component_rule_edit_title_label')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentTheme?.textColor,
                      borderColor: currentTheme?.borderColor,
                      backgroundColor: currentTheme?.inputBackground,
                    },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('component_rule_edit_title_placeholder')}
                  placeholderTextColor={currentTheme?.placeholderColor}
                  autoFocus
                />

                <Text
                  style={[
                    styles.fieldLabel,
                    { color: currentTheme?.textColor, marginTop: 16 },
                  ]}
                >
                  {t('component_rule_edit_match_label')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentTheme?.textColor,
                      borderColor: currentTheme?.borderColor,
                      backgroundColor: currentTheme?.inputBackground,
                    },
                  ]}
                  value={match}
                  onChangeText={setMatch}
                  placeholder={t('component_rule_edit_match_placeholder')}
                  placeholderTextColor={currentTheme?.placeholderColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text
                  style={[
                    styles.fieldLabel,
                    { color: currentTheme?.textColor, marginTop: 16 },
                  ]}
                >
                  {t('component_rule_edit_replace_label')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentTheme?.textColor,
                      borderColor: currentTheme?.borderColor,
                      backgroundColor: currentTheme?.inputBackground,
                    },
                  ]}
                  value={replace}
                  onChangeText={setReplace}
                  placeholder={t('component_rule_edit_replace_placeholder')}
                  placeholderTextColor={currentTheme?.placeholderColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { borderColor: currentTheme?.placeholderColor },
                    ]}
                    onPress={onClose}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: currentTheme?.placeholderColor },
                      ]}
                    >
                      {t('general_cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.applyButton,
                      {
                        backgroundColor: currentTheme?.primaryColor,
                        borderColor: currentTheme?.primaryColor,
                      },
                    ]}
                    onPress={handleSave}
                  >
                    <Text style={[styles.modalButtonText, { color: 'white' }]}>
                      {t('general_save')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  basContainer: {
    width: screenWidth - 32,
  },
  modalContainer: {
    width: screenWidth - 32,
    maxHeight: screenHeight * 0.9,
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  applyButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RuleEditModal;
