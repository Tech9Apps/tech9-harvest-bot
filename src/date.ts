const {
    endOfWeek,
    startOfWeek,
    startOfMonth,
    endOfMonth,
    lastDayOfWeek,
    isSameDay,
    addDays,
    format
} = require('date-fns');
const HarvestDateFormat = 'yyyyMMdd';

export const getWeeksInfo = (date: Date) => {
    return {startOfWeek: startOfWeek(date), endOfWeek: endOfWeek(date)};
}

export const  getMonthsInfo = (date: Date) => {
    return {startOfMonth: startOfMonth(date), endOfMonth: endOfMonth(date)};
}

export const  getReportWeekInfo = (date: Date) => {
    if (isSameDay(date, lastDayOfWeek(date))) {
        return getWeeksInfo(date);
    }
    const newDate = addDays(startOfWeek(date), -1);
    return getWeeksInfo(newDate);
}

export const  getFormattedWeekInfo = (date: Date) => {
    const {startOfWeek, endOfWeek} = getReportWeekInfo(date);

    return {
        startOfWeek: format(startOfWeek, HarvestDateFormat),
        endOfWeek: format(endOfWeek, HarvestDateFormat),
        start: startOfWeek,
        end: endOfWeek,
    }
}



