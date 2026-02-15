import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native'; // Import this

const QUEUE_KEY = 'downloadQueue';

export async function getDownloadQueue() {
  try {
    const queueData = await AsyncStorage.getItem(QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  } catch (error) {
    console.error('Error getting downloadQueue:', error);
    return [];
  }
}

export async function addToDownloadQueue(items) {
  try {
    const currentQueue = await getDownloadQueue();
    const itemsToAdd = Array.isArray(items) ? items : [items];

    const newQueue = [...currentQueue];
    itemsToAdd.forEach(newItem => {
      const exists = newQueue.find(q =>
        q.workId === newItem.workId && q.chapterId === newItem.chapterId
      );
      if (!exists) newQueue.push(newItem);
    });

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));

    DeviceEventEmitter.emit('queue_updated', newQueue);

    return newQueue;
  } catch (error) {
    console.error('Error adding to downloadQueue:', error);
  }
}

export async function popNextDownload() {
  try {
    const queue = await getDownloadQueue();
    if (queue.length === 0) return null;

    const nextItem = queue.shift();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    DeviceEventEmitter.emit('queue_updated', queue);

    return nextItem;
  } catch (error) {
    console.error('Error popping from queue:', error);
  }
}

export async function peekNextDownload() {
  const queue = await getDownloadQueue();
  return queue.length > 0 ? queue[0] : null;
}