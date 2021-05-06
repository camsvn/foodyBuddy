function diffDate(date1, date2) {
    let day = 1000*60*60*24;
    return ((date2 - date1) / day) + 1;
}

function diffMonth(date1, date2) {
    let months;
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    return months <= 0 ? 0 : months;
}

function addDays (days, date) {
    let newDate = new Date(date.getTime());
    newDate.setDate(date.getDate() + days);
    return newDate;
};

function getDaysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

function getLastDayOfMonth (date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0))
}

function formatDate(date) {
    let newDate = new Date(date.getTime());    
    return newDate.toISOString().split('T')[0];
}
    

module.exports = {
    diffDate,
    diffMonth,
    addDays,
    getDaysInMonth,
    getLastDayOfMonth,
    formatDate
}