import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUserInfo } from '../web/user/getUserInfo';
import { useEffect, useState } from 'react';

import RenderHtml from 'react-native-render-html';
import HtmlTextRenderer from '../components/common/HtmlTextRenderer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BookmarksScreen from './more/BookmarksScreen';
import UserWorkScreen from './more/UserWorkScreen';
import LoadingSpinner from '../components/History/Spinner';

export default function UserInfoScreen({
                                         currentTheme,
                                         username,
                                         onBack,
                                         setScreens,
                                         workDAO,
                                         libraryDAO,
                                         historyDAO,
                                         settingsDAO,
                                         progressDAO,
                                         kudoHistoryDAO,
                                         chapterDAO,
                                       }) {
  const [userInfo, setUserInfo] = useState();
  const [error, setError] = useState(false);

  useEffect(() => {
    loadUserInfo()
  }, [username]);

  const loadUserInfo = async () => {
    console.log('loadUserInfo');
    setError(false);
    setUserInfo(undefined);

    getUserInfo(username)
      .then((data) => {
        const bioHtml = data.bio ? data.bio.toString() : undefined;
        setUserInfo({ ...data, bio: bioHtml });
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  };

  function userHeader() {
    if (error) {
      return (
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: currentTheme.backgroundColor },
          ]}
        >
          <View style={styles.errorContainer}>
            <Icon
              name="error-outline"
              size={48}
              color={currentTheme.iconColor}
            />
            <Text style={[styles.errorText, { color: currentTheme.textColor }]}>
              Failed to load user data
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: currentTheme.primaryColor },
              ]}
              onPress={loadUserInfo}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    if (!userInfo) return (
      <LoadingSpinner
        currentTheme={currentTheme}
        message="Loading profile..."
      />
    );

    return (
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Icon name="arrow-back" size={24} color={currentTheme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: currentTheme.textColor }]}>
            User profile
          </Text>
        </View>
        <ScrollView>
          {userInfo ? (
            <>
              <View style={styles.headerContainer}>
                <View style={styles.profileHeader}>
                  <Image
                    source={{ uri: userInfo.avatarUrl }}
                    style={[styles.icon, { borderColor: currentTheme.borderColor, marginBottom: 0 }]}
                  />
                  <View style={styles.userDetails}>
                    <Text style={[styles.username, { color: currentTheme.textColor }]}>
                      {username}
                    </Text>
                    <Text style={[styles.joinDate, { color: currentTheme.secondaryTextColor }]}>
                      Joined: {userInfo.joinDate}
                    </Text>
                  </View>
                </View>

                {userInfo.bio &&
                  <>
                    <Text style={[styles.subTitle, { color: currentTheme.textColor }]}>
                      Bio
                    </Text>
                    <HtmlTextRenderer
                      html={userInfo.bio}
                      currentTheme={currentTheme}
                    />
                  </>
                }
              </View>

              <TouchableOpacity style={[styles.bookMarkButton, {borderColor: currentTheme.borderColor }]}
                                onPress={() => {
                                  setScreens(p => [...p, <BookmarksScreen
                                      setScreens={setScreens}
                                      historyDAO={historyDAO}
                                      settingsDAO={settingsDAO}
                                      progressDAO={progressDAO}
                                      workDAO={workDAO}
                                      libraryDAO={libraryDAO}
                                      kudoHistoryDAO={kudoHistoryDAO}
                                      currentTheme={currentTheme}
                                      username={username}
                                      chapterDAO={chapterDAO}
                                  />])
                                }}>
                <Text style={[styles.bookMarkButtonText, { color: currentTheme.textColor, }]}>
                  {"Bookmark"}
                </Text>
                <Icon name={"chevron-right"} size={24} color={currentTheme.iconColor} style={[{}]} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.workButton, {borderColor: currentTheme.borderColor }]}
                                onPress={() => {
                                  setScreens(p => [...p, <UserWorkScreen
                                    setScreens={setScreens}
                                    historyDAO={historyDAO}
                                    settingsDAO={settingsDAO}
                                    progressDAO={progressDAO}
                                    workDAO={workDAO}
                                    libraryDAO={libraryDAO}
                                    kudoHistoryDAO={kudoHistoryDAO}
                                    currentTheme={currentTheme}
                                    username={username}
                                    chapterDAO={chapterDAO}
                                  />])
                                }}>
                <Text style={[styles.bookMarkButtonText, { color: currentTheme.textColor, }]}>
                  {"Works"}
                </Text>
                <Icon name={"chevron-right"} size={24} color={currentTheme.iconColor} style={[{}]} />
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {userHeader()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    alignItems: 'flex-start',
  },
  loader: {
    marginTop: 50,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
  },
  bioWrapper: {
    width: '100%',
  },
  subTitle: {
    fontSize: 30,
    fontWeight: "bold"
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    width: "70%",
  },
  username: {
    fontSize: 20,
    paddingLeft: 10,
  },
  joinDate: {
    fontSize: 15,
    paddingLeft: 10,
  },
  bookMarkButton: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workButton: {
    borderBottomWidth: 1,
    padding: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 64,
  },
  bookMarkButtonText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});