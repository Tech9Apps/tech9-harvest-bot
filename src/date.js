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

const getWeeksInfo = (date) => {
    return {startOfWeek: startOfWeek(date), endOfWeek: endOfWeek(date)};
}

const getMonthsInfo = (date) => {
    return {startOfMonth: startOfMonth(date), endOfMonth: endOfMonth(date)};
}


const getReportWeekInfo = (date) => {
    if (isSameDay(date, lastDayOfWeek(date))) {
        return getWeeksInfo(date);
    }
    const newDate = addDays(startOfWeek(date), -1);
    return getWeeksInfo(newDate);
}

const getFormattedWeekInfo = (date) => {
    const {startOfWeek, endOfWeek} = getReportWeekInfo(date);

    return {
        startOfWeek: format(startOfWeek, HarvestDateFormat),
        endOfWeek: format(endOfWeek, HarvestDateFormat),
        start: startOfWeek,
        end: endOfWeek,
    }
}

module.exports = {
    getReportWeekInfo,
    getMonthsInfo,
    getFormattedWeekInfo,
};


