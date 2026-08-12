import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RuleEditModal from '../../components/WordReplacer/RuleEditModal';

const STORAGE_KEY = 'WordReplaceRules';

export default function WordReplacer({ route }) {
  const { currentTheme } = route.params;

  const [rules, setRules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const { t } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const res = await AsyncStorage.getItem(STORAGE_KEY);
      setRules(res ? JSON.parse(res) : []);
    } catch (error) {
      console.error('Error loading word replace rules:', error);
    }
  }

  async function saveRules(rulesToSave) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rulesToSave));
    } catch (error) {
      console.error('Error saving word replace rules:', error);
    }
  }

  function findValidTitle(count = 0) {
    const testTitle =
      count === 0
        ? t('screen_word_replacer_new_rule')
        : t('screen_word_replacer_new_rule_count', { count });

    if (rules.some(rule => rule.title === testTitle)) {
      return findValidTitle(count + 1);
    }
    return testTitle;
  }

  async function addRule() {
    const newRule = {
      title: findValidTitle(),
      match: '',
      replace: '',
      caseSensitive: false,
      useRegex: false,
    };
    const updated = [...rules, newRule];
    setRules(updated);
    await saveRules(updated);
  }

  function showDeleteConfirmation(rule) {
    Alert.alert(
      t('screen_word_replacer_delete_title'),
      t('screen_word_replacer_delete_message', { rule: rule.title }),
      [
        { text: t('general_cancel'), onPress: () => {}, style: 'cancel' },
        {
          text: t('general_delete'),
          onPress: () => removeRule(rule),
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  }

  async function removeRule(removedRule) {
    const updated = rules.filter(rule => rule !== removedRule);
    setRules(updated);
    await saveRules(updated);
  }

  function startEditing(rule) {
    setEditingRule(rule);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingRule(null);
  }

  async function saveRule(updatedRule) {
    const trimmedTitle = updatedRule.title.trim() || editingRule.title;

    const isDuplicate = rules.some(
      rule =>
        rule !== editingRule &&
        rule.title.toLowerCase() === trimmedTitle.toLowerCase(),
    );

    if (isDuplicate) {
      Alert.alert(
        t('screen_word_replacer_duplicate_title'),
        t('screen_word_replacer_duplicate_message', {
          trimmedName: trimmedTitle,
        }),
        [{ text: t('general_ok'), onPress: () => {} }],
      );
      return;
    }

    const finalRule = { ...updatedRule, title: trimmedTitle };
    const updated = rules.map(rule =>
      rule === editingRule ? finalRule : rule,
    );

    setRules(updated);
    await saveRules(updated);
    closeModal();
  }

  function onBack() {
    navigation.goBack();
  }

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: currentTheme?.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme?.textColor,
    },
    container: {
      flex: 1,
      padding: 16,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: currentTheme?.borderColor,
      backgroundColor: currentTheme?.cardBackground,
      gap: 12,
    },
    ruleTextWrap: {
      flex: 1,
    },
    ruleTitle: {
      fontSize: 16,
      color: currentTheme?.textColor,
      paddingVertical: 8,
    },
    ruleSubtitle: {
      fontSize: 13,
      color: currentTheme?.secondaryTextColor,
    },
    iconButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 16,
      borderRadius: 8,
      backgroundColor: currentTheme?.primaryColor,
      gap: 8,
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 16,
      color: currentTheme?.secondaryTextColor,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack}>
            <Icon name="arrow-back" size={24} color={currentTheme?.textColor} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('screen_word_replacer_title')}</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {rules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t('screen_word_replacer_empty_message')}
            </Text>
          </View>
        ) : (
          rules.map(rule => (
            <View key={rule.title} style={styles.ruleItem}>
              <View style={styles.ruleTextWrap}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                {rule.match || rule.replace ? (
                  <Text style={styles.ruleSubtitle} numberOfLines={1}>
                    {rule.match} | {rule.replace}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => startEditing(rule)}
              >
                <Icon name="edit" size={24} color={currentTheme?.textColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => showDeleteConfirmation(rule)}
              >
                <Icon name="delete" size={24} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <TouchableOpacity style={styles.addButton} onPress={addRule}>
          <Icon name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>
            {t('screen_word_replacer_new_rule')}
          </Text>
        </TouchableOpacity>
      </View>

      <RuleEditModal
        visible={modalVisible}
        currentTheme={currentTheme}
        rule={editingRule}
        onClose={closeModal}
        onSave={saveRule}
      />
    </SafeAreaView>
  );
}
