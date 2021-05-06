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
function getSubscriptionPairs (data) {
    let subscriptionPairs = [];
    let subscriptionTemp = [];

    for(let i = 0; i < data.length; i++) {
        if(data[i].action == "start"){
            subscriptionTemp = [];
            subscriptionTemp.push(data[i])
        } else {
            subscriptionTemp.push(data[i])
            subscriptionPairs.push(subscriptionTemp)
        }        
    }

    return subscriptionPairs;
}

function getSubscriptionPeriods(data) {
    let output = [];
    let subscriptionPairs = getSubscriptionPairs(data);

    for(let i = 0; i < subscriptionPairs.length; i++) {
        for(let j = 0; j < subscriptionPairs[i].length; j++) {
            if(subscriptionPairs[i][j].action == "start") {
                let dateStart = new Date(subscriptionPairs[i][j].date);
                let dateEnd = new Date(subscriptionPairs[i][j+1].date);

                let tempOp = {}
                tempOp.startDate = dateStart
                tempOp.endDate = dateEnd
                tempOp.plan = subscriptionPairs[i][j].plan
                output.push(tempOp)
            }

        }
    }
    return output;
}

function splitSubscriptionPeriods (data) {
    let output = [];
    let subscriptionPeriods = getSubscriptionPeriods(data);
    let fillTempObj = (startDate,endDate,plan) => {
        return {startDate,endDate,plan}
    }

    for( let i = 0 ; i < subscriptionPeriods.length ; i++) {
        let subStartDate = subscriptionPeriods[i].startDate;
        let subEndDate = subscriptionPeriods[i].endDate;
        let subscribedMonths = helperFunctions.diffMonth(subStartDate,subEndDate);

        if (subscribedMonths === 0) {
            // console.log(subStartDate,subscriptionPeriods[i-1]?.endDate)
            if(subStartDate.toDateString() === subscriptionPeriods[i-1]?.endDate.toDateString()) {
                if(subscriptionPlans[subscriptionPeriods[i].plan] < subscriptionPlans[subscriptionPeriods[i-1]?.plan]) {
                    output.push({...subscriptionPeriods[i],endDate: subStartDate, plan: subscriptionPeriods[i-1].plan});
                    subStartDate = helperFunctions.addDays(1, subStartDate);
                    output.push({...subscriptionPeriods[i],startDate: subStartDate});
                } else if (subscriptionPlans[subscriptionPeriods[i].plan] > subscriptionPlans[subscriptionPeriods[i-1]?.plan]) {
                    output.push(subscriptionPeriods[i]);
                }
            } else {
                output.push(subscriptionPeriods[i]);
            }
        }
        
        if (subscribedMonths > 0) {
            if(subStartDate.toDateString() === subscriptionPeriods[i-1]?.endDate.toDateString()) {
                if(subscriptionPlans[subscriptionPeriods[i].plan] < subscriptionPlans[subscriptionPeriods[i-1]?.plan])
                    subStartDate = helperFunctions.addDays(1, subStartDate);
            } // Rule 2 & 4
            let tempStartDate = subStartDate;
            output.push(fillTempObj(tempStartDate,helperFunctions.getLastDayOfMonth(tempStartDate),subscriptionPeriods[i].plan)) //Split Difference Month
            while(subscribedMonths) {
                tempStartDate = helperFunctions.addDays(1, helperFunctions.getLastDayOfMonth(tempStartDate))
                
                if(helperFunctions.diffMonth(tempStartDate,subEndDate)) {
                    output.push(fillTempObj(tempStartDate,helperFunctions.getLastDayOfMonth(tempStartDate),subscriptionPeriods[i].plan))
                } 
                subscribedMonths--
            } //Split Month
        }
    }

    return output;
}

function generateBill(splitSubscriptionPeriods) {
    return splitSubscriptionPeriods.map((v,i) => (
        {
        startDate : helperFunctions.formatDate(v.startDate),
        endDate : helperFunctions.formatDate(v.endDate),
        plan : v.plan,
        amount : helperFunctions.diffDate(v.startDate,v.endDate) * subscriptionPlans[v.plan]
        }
    ))
}

// console.time("logTime")
let data = splitSubscriptionPeriods(mockData);
console.log(generateBill(data))
// console.timeEnd("logTime")