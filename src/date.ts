import {
  eachWeekendOfMonth,
  getDaysInMonth,
  endOfWeek,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  lastDayOfWeek,
  isSameDay,
  addDays,
  format,
} from "date-fns";

const HarvestDateFormat = 'yyyyMMdd';

export const getWeeksInfo = (date: Date) => {
  return {startOfWeek: startOfWeek(date), endOfWeek: endOfWeek(date)};
}

export const getMonthsInfo = (date: Date) => {
  return {startOfMonth: startOfMonth(date), endOfMonth: endOfMonth(date)};
}

export const numberOfWorkingDays = (start: Date): number => {
  return getDaysInMonth(start) - eachWeekendOfMonth(start)?.length!;
};

export const getFormattedMonthInfo = (date: Date) => {
  const {startOfMonth, endOfMonth} = getMonthsInfo(date);

  return {
    startOfMonth: format(startOfMonth, HarvestDateFormat),
    endOfMonth: format(endOfMonth, HarvestDateFormat),
    start: startOfMonth,
    end: endOfMonth,
    numberOfWorkingDays: numberOfWorkingDays(startOfMonth)
  }
}

export const getReportWeekInfo = (date: Date) => {
  if (isSameDay(date, lastDayOfWeek(date))) {
    return getWeeksInfo(date);
  }
  const newDate = addDays(startOfWeek(date), -1);
  return getWeeksInfo(newDate);
}


export const getFormattedWeekInfo = (date: Date) => {
  const {startOfWeek, endOfWeek} = getReportWeekInfo(date);

  return {
    startOfWeek: format(startOfWeek, HarvestDateFormat),
    endOfWeek: format(endOfWeek, HarvestDateFormat),
    start: startOfWeek,
    end: endOfWeek,
  }
}



