import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'SearchPresets';
const DEFAULT_DATA = { presets: [] };

export async function getJsonPresets() {
  try {
    const dataString = await AsyncStorage.getItem(STORAGE_KEY);

    if (dataString) {
      return JSON.parse(dataString);
    }

    return DEFAULT_DATA;
  } catch (error) {
    console.error('Error getting JSON settings:', error);
    return DEFAULT_DATA;
  }
}

export async function pushJsonPreset(jsonObject) {
  try {
    const settings = await getJsonPresets();
    const existingIndex = settings.presets.findIndex(
      preset => preset.name === jsonObject.name
    );
    if (existingIndex !== -1) {
      settings.presets[existingIndex] = jsonObject;
    } else {
      settings.presets.push(jsonObject);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings.presets;
  } catch (error) {
    console.error('Error adding JSON preset:', error);
  }
}

export async function getAllPresets() {
  try {
    const settings = await getJsonPresets();
    return settings.presets;
  } catch (error) {
    console.error('Error getting presets:', error);
    return [];
  }
}

export async function containsPreset(name) {
  try {
    const settings = await getJsonPresets();
    return settings.presets.some(preset => preset.name === name);
  } catch (error) {
    console.error('Error checking preset:', error);
    return false;
  }
}

export async function removePreset(index) {
  try {
    const settings = await getJsonPresets();
    settings.presets.splice(index, 1);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings.presets;
  } catch (error) {
    console.error('Error removing preset:', error);
  }
}

export async function clearAllPresets() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  } catch (error) {
    console.error('Error clearing presets:', error);
  }
}