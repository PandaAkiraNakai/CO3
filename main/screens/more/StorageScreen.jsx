import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { exportDb } from '../../storage/DatabaseManager';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import CustomToast from '../../components/common/CustomToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bar } from 'react-native-progress';
import { useContext, useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import { countDownloads } from '../../downloads/Downloader';
import { AppContext } from '../../app';

export default function StorageScreen({ route }) {
  const { setScreens, currentTheme, databaseObj } = route.params;
  const { workDAO, chapterDAO } = useContext(AppContext)

  const navigation = useNavigation();

  function onBack() {
    navigation.goBack();
  }

  const { t } = useTranslation();

  const [storageData, setStorageData] = useState();
  const [downloadedCount, setDownloadedCount] = useState();
  const [cachedWorksCount, setCachedWorksCount] = useState();
  const [cachedChaptersCount, setCachedChaptersCount] = useState();

  useEffect(() => {
    async function getStorageData() {
      const totalSpace = await DeviceInfo.getTotalDiskCapacity();
      const freeSpace = await DeviceInfo.getFreeDiskStorage();

      const totalRawGB = totalSpace / (1024 * 1024 * 1024);
      const freeRawGB = freeSpace / (1024 * 1024 * 1024);
      const usedRawGB = totalRawGB - freeRawGB;

      setStorageData({
        totalSpace: totalSpace,
        freeSpace: freeSpace,
        totalGB: totalRawGB.toFixed(2),
        freeGB: freeRawGB.toFixed(2),
        usedGB: usedRawGB.toFixed(2),
      });
    }

    async function getDownloadedCount() {
      setDownloadedCount(await countDownloads());
    }

    async function getCachedCount() {
      setCachedWorksCount(await workDAO.countWorks())
      setCachedChaptersCount(await chapterDAO.countChapters())
    }

    getStorageData();
    getDownloadedCount();
    getCachedCount();

  }, []);

  return (
    <SafeAreaView
      style={[
        { backgroundColor: currentTheme.backgroundColor },
        styles.container,
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-back" size={24} color={currentTheme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>
          {t('screen_storage_title')}
        </Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={[{ color: currentTheme.textColor }]}>
          Usage: {storageData?.usedGB || '?'} GB / {storageData?.totalGB || '?'}{' '}
          GB
        </Text>
        <Bar
          progress={
            storageData?.freeGB &&
            storageData?.totalGB &&
            storageData.usedGB / storageData.totalGB
          }
          width={null}
          color={currentTheme.primaryColor}
          backgroundColor={currentTheme.inputBackground}
          borderColor={currentTheme.borderColor}
          height={10}
          borderRadius={20}
        />
        <Text style={[{ color: currentTheme.textColor, paddingTop: 10 }]}>
          Downloaded chapters:{' '}
          {downloadedCount?.chapterCount ?? t('general_loading')}
        </Text>
        <Text style={[{ color: currentTheme.textColor }]}>
          Cached works: {cachedWorksCount}
        </Text>
        <Text style={[{ color: currentTheme.textColor, paddingBottom: 10 }]}>
          Cached chapters: {cachedChaptersCount}
        </Text>

        <TouchableOpacity>
          <Text
            style={[
              styles.button,
              {
                color: currentTheme.textColor,
                backgroundColor: currentTheme.primaryColor,
              },
            ]}
          >
            {t('screen_storage_button_clear_unused_cache')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={[
              styles.button,
              {
                color: currentTheme.textColor,
                backgroundColor: currentTheme.primaryColor,
              },
            ]}
          >
            {t('screen_storage_button_delete_downloaded')}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Icon name="storage" size={20} color={currentTheme.iconColor} />
          <Text
            style={[styles.sectionTitle, { color: currentTheme.textColor }]}
          >
            {t('screen_storage_section_backups')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            exportDb(databaseObj)
              .then(() => {
                Toast.show({
                  type: 'success',
                  text1: t('screen_storage_export_database_success'),
                  text2: t('screen_storage_export_database_success_sub'),
                });
              })
              .catch(err => {
                Toast.show({
                  type: 'error',
                  text1: t('screen_storage_export_database_error_generic'),
                  text2: err.message,
                });
              });
          }}
        >
          <Text
            style={[
              styles.button,
              {
                color: currentTheme.textColor,
                backgroundColor: currentTheme.primaryColor,
              },
            ]}
          >
            {t('screen_storage_button_create_backup')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={[
              styles.button,
              {
                color: currentTheme.textColor,
                backgroundColor: currentTheme.primaryColor,
              },
            ]}
          >
            {t('screen_storage_button_import_backup')}
          </Text>
        </TouchableOpacity>

        <Text style={{ color: currentTheme.textColor, paddingTop: 10 }}>
          Backup may contain sensitive data. They include: Full reading history,
          Library, Settings, Downloaded chapters and more.
        </Text>
        <Text style={{ color: currentTheme.textColor, paddingTop: 10 }}>
          They do not include your username or your password.
        </Text>
      </ScrollView>
      <CustomToast currentTheme={currentTheme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  previewContainer: {
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginRight: 12,
  },
  sizeInput: {
    width: 60,
    textAlign: 'center',
    fontWeight: '600',
  },
  themeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewModeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});
