import { NativeModules, AppRegistry, Platform } from 'react-native';
import { fetchWorkFromWorkID } from './worksScreen/fetchWork';
import { database } from '../storage/Database';
import { WorkDAO } from '../storage/dao/WorkDAO';
import { UpdateDAO } from '../storage/dao/UpdateDAO';
import { Update } from '../storage/models/update';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import { getJsonSettings } from '../storage/jsonSettings';
import { ChapterDAO } from '../storage/dao/ChapterDAO';
import BackgroundActions from 'react-native-background-actions';

const { LibraryScheduler } = NativeModules;

if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask('LibraryUpdate', () => async () => {
    await run();
  });
}

const getMergedIconName = work => {
  let r = 'nr';
  switch (work.rating) {
    case 'General Audiences': r = 'gen'; break;
    case 'Teen And Up Audiences': r = 'teen'; break;
    case 'Mature': r = 'mat'; break;
    case 'Explicit': r = 'exp'; break;
    case 'Not Rated': r = 'nr'; break;
  }

  let c = 'gen';
  const cat = work.category || '';
  if (cat.split(' ').length > 1 && cat !== 'No category') c = 'multi';
  else if (cat === 'F/F') c = 'ff';
  else if (cat === 'F/M') c = 'fm';
  else if (cat === 'M/M') c = 'mm';
  else if (cat === 'Multi') c = 'multi';
  else if (cat === 'Other') c = 'other';
  else if (cat === 'Gen') c = 'gen';

  let w = 'none';
  const warn = work.warnings || '';
  if (work.warningStatus === 'Yes' || warn.includes('WarningGiven')) w = 'warn';
  else if (warn.includes('Creator Chose')) w = 'cntua';
  else if (warn.includes('No Archive')) w = 'none';
  else if (warn.includes('External')) w = 'ext';

  const isComplete =
    work.isCompleted ||
    (work.chapterCount > 0 && work.chapterCount === work.currentChapter);
  const s = isComplete ? 'comp' : 'wip';

  return `ic_${r}_${c}_${w}_${s}`.toLowerCase();
};

const getEmojiStatus = (work) => {
  let text = '';
  if (work.rating === 'Explicit') text += '🔞 ';
  else if (work.rating === 'Mature') text += '🛑 ';
  if (work.warningStatus === 'Yes') text += '⚠️ ';
  if (work.category && work.category !== 'No category') text += `[${work.category}] `;
  return text;
};

export const setup = (intervalMinutes) => {
  if (!LibraryScheduler) {
    console.warn('[LibraryScheduler] Native module not found — background updates disabled.');
    return;
  }
  LibraryScheduler.schedule(intervalMinutes);
  console.log('[LibraryScheduler] Scheduled with interval: ' + intervalMinutes + ' min');
};

export const cancel = () => {
  if (!LibraryScheduler) return;
  LibraryScheduler.cancel();
  console.log('[LibraryScheduler] Cancelled.');
};

export const run = async () => {
  const settings = getJsonSettings();
  const useCompactNotification = settings.compactNotifications;

  // Define the background task that will run inside a foreground service
  const scanningTask = async (taskData) => {
    const { toUpdate, workDAO, chapterDAO, updateDAO, useCompactNotification } = taskData;
    const updatedWorks = [];
    const errorWork = [];
    const total = toUpdate.length;

    for (let i = 0; i < total; i++) {
      const uwork = toUpdate[i];

      // Update the persistent notification with current progress
      await BackgroundActions.updateNotification({
        taskTitle: 'Updating your library…',
        taskDesc: `${Math.floor((i / total) * 100)}% – ${uwork.title}`,
        progressBar: {
          max: total,
          value: i,
          indeterminate: false,
        },
        // The notification itself will remain ongoing and silent (low importance)
        silent: true,
      });

      try {
        // Random delay to avoid hitting servers too fast
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        const updatedWork = await updateWork(uwork.id, workDAO, chapterDAO);

        if (updatedWork && updatedWork.currentChapter > uwork.currentChapter) {
          const newChapterNumbers = [];
          for (
            let chNum = uwork.currentChapter + 1;
            chNum <= updatedWork.currentChapter;
            chNum++
          ) {
            const newChapter = updatedWork.chapters.find(ch => ch.number === chNum);
            newChapterNumbers.push(chNum);
            const update = new Update({
              workId: updatedWork.id,
              chapterNumber: chNum,
              chapterID: newChapter ? String(newChapter.id) : `${updatedWork.id}_${chNum}`,
              date: Date.now(),
            });
            await updateDAO.add(update);
          }

          updatedWorks.push(updatedWork);

          if (!useCompactNotification && newChapterNumbers.length > 0) {
            const iconName = getMergedIconName(updatedWork);
            const chaptersStr = newChapterNumbers.join(', ');
            const firstChapterNumber = newChapterNumbers[0];

            // Individual chapter notifications are still sent via notifee
            await notifee.displayNotification({
              id: `work_${updatedWork.id}`,
              title: updatedWork.title,
              body: `Chapter ${chaptersStr}`,
              data: {
                action: 'OPEN_WORK',
                workId: updatedWork.id,
                chapterNumber: firstChapterNumber,
              },
              android: {
                channelId: 'updateWorks',
                groupId: 'library_updates',
                largeIcon: iconName,
                pressAction: { id: 'default', launchActivity: 'default' },
              },
            });
          }
        }
      } catch (error) {
        console.log(error);
        errorWork.push(uwork);
      }
    }

    // After loop, set final notification progress
    await BackgroundActions.updateNotification({
      taskTitle: 'Update complete',
      taskDesc: `Found updates for ${updatedWorks.length} works.`,
      progressBar: undefined, // remove progress bar
      silent: false, // maybe make a sound now
    });

    // Store results to be used after the background action finishes
    return { updatedWorks, errorWork };
  };

  try {
    // Create channels for notifee (summary and error notifications)
    await notifee.createChannel({
      id: 'updateWorks',
      name: 'Library Updates',
      importance: AndroidImportance.DEFAULT,
    });

    const db = await database.open();
    const workDAO = new WorkDAO(db);
    const updateDAO = new UpdateDAO(db);
    const chapterDAO = new ChapterDAO(db);

    const toUpdate = (await workDAO.getAll()).filter(
      work => work.chapterCount !== work.currentChapter
    );

    if (toUpdate.length === 0) {
      // Nothing to scan – stop immediately
      return;
    }

    // Configuration for the foreground service notification
    const options = {
      taskName: 'LibraryUpdate',
      taskTitle: 'Checking for updates...',
      taskDesc: `Scanning ${toUpdate.length} works...`,
      taskIcon: {
        name: 'ic_launcher', // your app's icon
        type: 'mipmap',
      },
      color: '#ff00ff', // optional accent color
      linkingURI: 'yourapp://home', // optional deep link
      progressBar: {
        max: toUpdate.length,
        value: 0,
        indeterminate: false,
      },
      // Parameters passed to the task function
      parameters: {
        toUpdate,
        workDAO,
        chapterDAO,
        updateDAO,
        useCompactNotification,
      },
    };

    // Start the background action – this will show the persistent notification
    const { updatedWorks, errorWork } = await BackgroundActions.start(
      scanningTask,
      options
    );

    // The foreground service has stopped after scanningTask resolves.
    // Now send final summary / error notifications via notifee.
    if (updatedWorks.length > 0) {
      if (useCompactNotification) {
        await notifee.displayNotification({
          id: 'updateComplete',
          title: 'Update complete',
          body: `Found updates for ${updatedWorks.length} works.`,
          android: {
            channelId: 'updateWorks',
            pressAction: { id: 'default' },
            style: {
              type: AndroidStyle.INBOX,
              lines: updatedWorks.map(w => w.title),
            },
          },
        });
      } else {
        await notifee.displayNotification({
          id: 'group_summary',
          title: 'Library Updates',
          subtitle: `${updatedWorks.length} works updated`,
          android: {
            channelId: 'updateWorks',
            groupSummary: true,
            groupId: 'library_updates',
            autoCancel: true,
            pressAction: { id: 'default' },
          },
        });
      }
    }

    if (errorWork.length > 0) {
      await notifee.displayNotification({
        id: 'updateError',
        title: 'Update Issues',
        body: `Failed to update ${errorWork.length} works.`,
        android: {
          channelId: 'updateWorks',
          style: {
            type: AndroidStyle.INBOX,
            lines: errorWork.map(w => w.title),
          },
        },
      });
    }
  } catch (error) {
    console.log('[LibraryScheduler] Task error:', error);
    // Ensure the background action is stopped if something failed
    try {
      await BackgroundActions.stop();
    } catch (_) {}
  }
};

export async function updateWork(workId, workDAO, chapterDAO) {
  const work = await fetchWorkFromWorkID(workId, workDAO, chapterDAO, true, true);
  if (work) {
    await workDAO.update(work);
  }
  return work;
}

export const setupNotificationListeners = (setActiveScreen, setScreens, openWorkDetails) => {
  const handlePress = async (detail) => {
    const { notification } = detail;
    const data = notification?.data;

    if (data?.action === 'OPEN_WORK' && data?.workId) {
      console.log(`Opening Work: ${data.workId}, Chapter Number: ${data.chapterNumber}`);
      setActiveScreen('update');
      if (openWorkDetails) openWorkDetails(data.workId, data.chapterNumber);
    } else if (
      notification?.id === 'updateComplete' ||
      notification?.id === 'group_summary'
    ) {
      setActiveScreen('update');
    }
  };

  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) handlePress(detail);
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) handlePress(detail);
  });
};