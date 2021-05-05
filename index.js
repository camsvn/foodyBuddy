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
function getSubscriptionPairs () {
    let subscriptionPairs = [];
    let subscriptionTemp = [];

    for(let i = 0; i < mockData.length; i++) {
        if(mockData[i].action == "start"){
            subscriptionTemp = [];
            subscriptionTemp.push(mockData[i])
        } else {
            subscriptionTemp.push(mockData[i])
            subscriptionPairs.push(subscriptionTemp)
        }        
    }

    return subscriptionPairs;
}

function getSubscriptionPeriods() {
    let output = [];
    let subscriptionPairs = getSubscriptionPairs();

    for(let i = 0; i < subscriptionPairs.length; i++) {
        for(let j = 0; j < subscriptionPairs[i].length; j++) {
            if(subscriptionPairs[i][j].action == "start") {
                let dateStart = new Date(subscriptionPairs[i][j].date);
                let dateEnd = new Date(subscriptionPairs[i][j+1].date);

                let tempOp = {}
                // tempOp.startDate = subscriptionPairs[i][j].date
                // tempOp.endDate = subscriptionPairs[i][j+1].date
                tempOp.startDate = dateStart
                tempOp.endDate = dateEnd
                tempOp.plan = subscriptionPairs[i][j].plan
                // tempOp.amount = helperFunctions.diffDate(dateStart,dateEnd) * subscriptionPlans[subscriptionPairs[i][j].plan]
                output.push(tempOp)
            }

        }
    }
    return output;
}

function splitSubscriptionPeriods () {
    let output = [];
    let subscriptionPeriods = getSubscriptionPeriods();
    let fillTempObj = (startDate,endDate,plan) => {
        return {startDate,endDate,plan}
    }

    for( let i = 0 ; i < subscriptionPeriods.length ; i++) {
        let subStartDate = subscriptionPeriods[i].startDate;
        let subEndDate = subscriptionPeriods[i].endDate;
        let subscribedMonths = helperFunctions.diffMonth(subStartDate,subEndDate);

        subscribedMonths === 0 && output.push(subscriptionPeriods[i]);
        
        // if(subStartDate.toDateString() === subscriptionPeriods[i-1]?.endDate.toDateString()) {
        //     subStartDate = helperFunctions.addDays(1, subEndDate);
        //     output.push({...subscriptionPeriods[i], startDate: subStartDate})
        // }

        if( subscribedMonths > 0) {
            if(subStartDate.toDateString() === subscriptionPeriods[i-1]?.endDate.toDateString()) { 
                subStartDate = helperFunctions.addDays(1, subStartDate);
            } // Rule 2 & 4
            let tempStartDate = subStartDate;
            output.push(fillTempObj(tempStartDate,helperFunctions.getLastDayOfMonth(tempStartDate),subscriptionPeriods[i].plan)) //Split Difference Month
            while(subscribedMonths) {
                tempStartDate = helperFunctions.addDays(1, helperFunctions.getLastDayOfMonth(tempStartDate))
                
                if(helperFunctions.diffMonth(tempStartDate,subEndDate)) {
                    output.push(fillTempObj(tempStartDate,helperFunctions.getLastDayOfMonth(tempStartDate),subscriptionPeriods[i].plan))
                } else {
                    if(tempStartDate.toDateString() !== subEndDate.toDateString())
                        output.push(fillTempObj(tempStartDate,subEndDate,subscriptionPeriods[i].plan))
                }
                subscribedMonths--
            } //Split Month
        }
    }

    return output;
}


// console.time("logTime")
// console.timeEnd("logTime")
// splitSubscriptionPeriods();

console.log(splitSubscriptionPeriods())
