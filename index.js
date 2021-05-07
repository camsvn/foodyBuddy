var  mockData = require('./mockData');
var  helperFunctions = require('./helper');

const subscriptionPlans = {
    bronze : 10,
    silver : 20,
    gold : 30 
}

// console.time("logTime")
const bill = generateBill(mockData)
helperFunctions.print(bill);
// console.timeEnd("logTime")


function generateBill (data) {
    let subStartArray = helperFunctions.filterArray(data,"start");
    let subEndArray = helperFunctions.filterArray(data,"stop");
    const [sBufferFill, eBufferFill] = bufferMonthFill(subStartArray,subEndArray);
    let subscriptions = filterSubs(sBufferFill);
    let endDates = eBufferFill.map( item => item.date);
    let getEndDate = (fromDate, toDate) => {
        let endDate;
        if(toDate !== undefined) {
            if(helperFunctions.diffDate(fromDate,toDate) === 1) {
                endDate = fromDate
            } else if (endDates.some(item => JSON.stringify(item) === JSON.stringify(toDate))) {
                endDate = helperFunctions.addDays(-1, toDate)
            } 
            else {
                endDate = new Date(endDates.filter(endDate => endDate > fromDate && endDate<toDate).join())
            }
        } else {
            endDate = endDates[endDates.length - 1];
        }
        return endDate;       
    }

    let billArray = subscriptions.map((item,index) => {
        let tempObj = {};
        tempObj.startDate = item.date;
        tempObj.endDate = getEndDate(item.date,subscriptions[index+1]?.date) ;
        tempObj.plan = item.plan;
        tempObj.amount = ( helperFunctions.diffDate(tempObj.startDate,tempObj.endDate) + 1 ) * subscriptionPlans[item.plan];

        return tempObj;
    })

    return billArray;
}

function filterSubs(subscriptions) {
    let output = [];

    subscriptions.map((mItem) => {

        let isSubscriptionPushed = output.some(item => {
            return item.date.getTime() === mItem.date.getTime()
        })

        let filterArray = subscriptions.filter((fItem) => {
            return fItem.date.getTime() === mItem.date.getTime()
        })

        filterArray.length === 1 && output.push(mItem);

        if(filterArray.length > 1 && !isSubscriptionPushed) {
            let higestPlan = filterArray.reduce((max, item) => 
            (subscriptionPlans[max.plan] > subscriptionPlans[item.plan] ? max : item)) //filter highest plan of the day

            output.push(higestPlan);

            let lastActivePlanOfDay = filterArray[filterArray.length - 1];

            if(JSON.stringify(higestPlan) !== JSON.stringify(lastActivePlanOfDay)) {
                output.push(
                    {...lastActivePlanOfDay,
                        date: helperFunctions.addDays(1,lastActivePlanOfDay.date)
                    }) //increment date
            }            
        }
    })
    return output;
}


function bufferMonthFill(startSubscriptions, endSubscriptions) {
   let startBufferFill = [];
   let endBufferFill = [];

   //pre-startBufferFill
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

    //post-startBufferFill
    let monthDifferenceRecentSub = helperFunctions.diffMonth(startSubscriptions[startSubscriptions.length-1].date,endSubscriptions[endSubscriptions.length-1].date)
    let newSubStart = startSubscriptions[startSubscriptions.length-1].date
    while(monthDifferenceRecentSub) {            
        newSubStart = helperFunctions.addDays(1, helperFunctions.getLastDayOfMonth(newSubStart))
        startBufferFill.push({...startSubscriptions[startSubscriptions.length-1],date: newSubStart})            
        monthDifferenceRecentSub--
    }

    //endBufferFill
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