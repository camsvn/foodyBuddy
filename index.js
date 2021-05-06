var  mockData = require('./mockData');
var  helperFunctions = require('./helper');

var subscriptionPlans = {
    bronze : 10,
    silver : 20,
    gold : 30 
}

/**
 * Output Format
 * [{
 *  startdate: 2019-01-01,
 *  enddate: 2019-01-10,
 *  plan: "gold",
 *  amount: 300
 * }]
 */


/**
 * Billing Rules:
 * 1. most expensive plan is charged , if multiple plans are changed for the day
 * 2. subscriber is billed for the entire day, even if plan is stopped in day
 * 3. can have multiple plan switches during a month, or no plan at all (pay-per-use)
 * 4. If a subscription lasts up to the current date, the user cannot be billed for the current date.
 */

function filterArray(data, type) {
     return data.filter((item) => item.action === type).map((item,index) => {
        let date = new Date(item.date)
        return {...item, date}
     })
}

function bufferMonthFill(startSubscriptions, endSubscriptions) {
   let startBufferFill = [];
   let endBufferFill = [];
    for( let i = 0 ; i < startSubscriptions.length ; i++) {
        let monthDifference = helperFunctions.diffMonth(startSubscriptions[i].date,startSubscriptions[i+1]?.date)
        let newSubStart = startSubscriptions[i].date
        startBufferFill.push(startSubscriptions[i])
        while(monthDifference) {            
            newSubStart = helperFunctions.addDays(1, helperFunctions.getLastDayOfMonth(newSubStart))
            startBufferFill.push({...startSubscriptions[i],date: newSubStart})            
            monthDifference--
        }        
    }

    let monthDifferenceRecentSub = helperFunctions.diffMonth(startSubscriptions[startSubscriptions.length-1].date,endSubscriptions[endSubscriptions.length-1].date)
    let newSubStart = startSubscriptions[startSubscriptions.length-1].date
    while(monthDifferenceRecentSub) {            
        newSubStart = helperFunctions.addDays(1, helperFunctions.getLastDayOfMonth(newSubStart))
        startBufferFill.push({...startSubscriptions[startSubscriptions.length-1],date: newSubStart})            
        monthDifferenceRecentSub--
    }

    for( let i = 0 ; i < endSubscriptions.length ; i++) {
        let monthDifference = helperFunctions.diffMonth(endSubscriptions[i].date,endSubscriptions[i+1]?.date)
        let newSubEnd = endSubscriptions[i].date
        endBufferFill.push(endSubscriptions[i])
        while(monthDifference) {            
            newSubEnd = helperFunctions.getLastDayOfMonth(newSubEnd)
            endBufferFill.push({...endSubscriptions[i+1],date: newSubEnd})            
            monthDifference--
            newSubEnd = helperFunctions.addDays(1, helperFunctions.getLastDayOfMonth(newSubEnd))
        }
    }
    return [startBufferFill, endBufferFill]

}

function generateBill (data) {
    let subStartArray = filterArray(data,"start")
    let subEndArray = filterArray(data,"stop")

    // console.log(subStartArray,subEndArray)
    const [startBufferFill, endBufferFill] = bufferMonthFill(subStartArray,subEndArray)
    console.log(startBufferFill,endBufferFill)
}


// console.time("logTime")
generateBill(mockData)
// console.timeEnd("logTime")