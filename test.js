
let Round = {
    refLog: [
        {
            userRef: "a"
        },
        {
            userRef: "a"
        },
        {
            userRef: "a"
        },
        {
            userRef: "a"
        },
        {
            userRef: "b"
        },
        {
            userRef: "c"
        },
        {
            userRef: "a"
        },
        {
            userRef: "b"
        },
        {
            userRef: "c"
        },
        {
            userRef: "a"
        },
        {
            userRef: "b"
        },
        {
            userRef: "c"
        },
        {
            userRef: "c"
        },
        {
            userRef: "c"
        },
        {
            userRef: "c"
        },
        {
            userRef: "c"
        },
        {
            userRef: "a"
        },
        {
            userRef: "b"
        },
        {
            userRef: "d"
        },
        {
            userRef: "b"
        },
        {
            userRef: "d"
        },
        {
            userRef: "b"
        },
        {
            userRef: "d"
        },
    ]
}


// var all_affilated_round = JSON.parse(JSON.stringify(Round.refLog))

// let setRef = new Set()
// let usertop = {}
// all_affilated_round.forEach(item => { setRef.add(item.userRef) })
// console.log("setRef", setRef);

// setRef = Array.from(setRef)
// setRef.forEach(item => usertop[item] = 0)
// all_affilated_round.forEach(item => { usertop[item.userRef]++ })
// let sorted = []
// for ([key, val] of Object.entries(usertop)) {
//     sorted.push({ userRef: key, count: val })
// }

// sorted = _.sortBy(sorted, ["count"])
// sorted = sorted.reverse()
// console.log(sorted);


// var all_affilated_round = JSON.parse(JSON.stringify(Round.refLog))

// let sorted = []
// let usertop = {}
// all_affilated_round.forEach(item => { usertop[item.userRef] !== undefined ? usertop[item.userRef]++ : usertop[item.userRef] = 0 })
// for ([key, val] of Object.entries(usertop)) {
//     sorted.push({ userRef: key, count: val })
// }
// sorted = sorted.sort((a, b) => a.count - b.count)
// console.log(sorted.reverse());
// sorted = sorted.slice(0, 2)
// console.log(sorted);


let dayjs = require("dayjs")
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

let d = dayjs().utc(0).add(1, "day")

var year = d.get('year');
var month = d.get('month');
var date = d.get('date');
let startCurrentDay = dayjs().utc(0).year(year).month(month).date(date).hour(0).minute(0).second(0).millisecond(0)
let endCurrentDay = dayjs().utc(0).year(year).month(month).date(date).hour(17).minute(0).second(0).millisecond(0)
console.log("start", startCurrentDay.format());
console.log("end", endCurrentDay.format());
