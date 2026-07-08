import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CalendarModal = ({
                           visible,
                           currentTheme,
                           dateRange,
                           readingDates,
                           onClose,
                           onDateRangeChange,
                           onApplyFilter,
                       }) => {
    const [selectedDates, setSelectedDates] = useState({});

    const { t } = useTranslation();

    const handleCalendarDayPress = (day) => {
        const dateString = day.dateString;

        if (!dateRange.start || (dateRange.start && dateRange.end)) {
            const newDateRange = { start: dateString, end: null };
            onDateRangeChange(newDateRange);
            setSelectedDates({
                [dateString]: { selected: true, startingDay: true, color: currentTheme.primaryColor }
            });
        } else if (dateRange.start && !dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateString);

            if (end < start) {
                const newDateRange = { start: dateString, end: dateRange.start };
                onDateRangeChange(newDateRange);
                setSelectedDates(getDateRangeSelection(dateString, dateRange.start));
            } else {
                const newDateRange = { start: dateRange.start, end: dateString };
                onDateRangeChange(newDateRange);
                setSelectedDates(getDateRangeSelection(dateRange.start, dateString));
            }
        }
    };

    const getDateRangeSelection = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates = {};

        const current = new Date(start);
        while (current <= end) {
            const dateString = current.toISOString().split('T')[0];
            dates[dateString] = {
                selected: true,
                color: currentTheme.primaryColor,
                startingDay: dateString === startDate,
                endingDay: dateString === endDate,
            };
            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

    const getCalendarMarkedDates = () => {
        const marked = { ...selectedDates };

        readingDates.forEach(date => {
            if (!marked[date]) {
                marked[date] = {
                    marked: true,
                    dotColor: currentTheme.primaryColor,
                    selectedColor: currentTheme.primaryColor
                };
            } else {
                marked[date] = {
                    ...marked[date],
                    marked: true,
                    dotColor: currentTheme.primaryColor
                };
            }
        });

        return marked;
    };

    const handleClearSelection = () => {
        onDateRangeChange({ start: null, end: null });
        setSelectedDates({});
    };

    const handleModalOverlayPress = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleModalOverlayPress}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={[styles.basContainer]}>
                        <ScrollView style={[styles.modalContainer, { backgroundColor: currentTheme.backgroundColor }]}>
                          <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>
                              {t("component_calendar_title")}
                            </Text>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                              <Icon name="close" size={24} color={currentTheme.placeholderColor} />
                            </TouchableOpacity>
                          </View>

                          <Text style={[styles.modalSubtitle, { color: currentTheme.placeholderColor }]}>
                            {dateRange.start && dateRange.end
                              ? t("component_calendar_sub_start_end", { start: dateRange.start, end: dateRange.end })
                              : dateRange.start
                                ? t("component_calendar_sub_start", { start: dateRange.start })
                                : t("component_calendar_sub")
                            }
                          </Text>

                          <Calendar
                            onDayPress={handleCalendarDayPress}
                            markedDates={getCalendarMarkedDates()}
                            markingType="period"
                            theme={{
                              backgroundColor: currentTheme.backgroundColor,
                              calendarBackground: currentTheme.backgroundColor,
                              textSectionTitleColor: currentTheme.textColor,
                              selectedDayBackgroundColor: currentTheme.primaryColor,
                              selectedDayTextColor: 'white',
                              todayTextColor: currentTheme.primaryColor,
                              dayTextColor: currentTheme.textColor,
                              textDisabledColor: currentTheme.placeholderColor,
                              dotColor: currentTheme.primaryColor,
                              selectedDotColor: 'white',
                              arrowColor: currentTheme.primaryColor,
                              monthTextColor: currentTheme.textColor,
                              indicatorColor: currentTheme.primaryColor,
                              textDayFontWeight: '300',
                              textMonthFontWeight: 'bold',
                              textDayHeaderFontWeight: '300',
                              textDayFontSize: 16,
                              textMonthFontSize: 16,
                              textDayHeaderFontSize: 13
                            }}
                          />

                          <View style={styles.modalButtons}>
                            <TouchableOpacity
                              style={[styles.modalButton, { borderColor: currentTheme.placeholderColor }]}
                              onPress={handleClearSelection}
                            >
                              <Text style={[styles.modalButtonText, { color: currentTheme.placeholderColor }]}>
                                {t("component_calendar_clear")}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.modalButton,
                                styles.applyButton,
                                {
                                  backgroundColor: currentTheme.primaryColor,
                                  borderColor: currentTheme.primaryColor
                                }
                              ]}
                              onPress={onApplyFilter}
                            >
                              <Text style={[styles.modalButtonText, { color: 'white' }]}>
                                {dateRange.start ? t("component_calendar_apply") : t("component_calendar_show_all")}
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
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
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

export default CalendarModal;