define([
    "util/utils"
],

function(utils) {
    var values = [{

        name : "00 Income By State",
        code : 'users := //users\nincomeByState := forall \'location\n\t{location: \'location, mean : mean(users.income where users.location = \'location)}\nincomeByState where incomeByState.mean = max(incomeByState.mean)'
    }, {
        name : "01 Json - Object",
        code : '{name: "John", age: 29, gender: "male"}'
    }, {
        name : "02 Json - Value",
        code : 'true'
    }, {
        name : "03 Json - String",
        code : '"hello world"'
    },
    // NUMBERS
    {
        name : "04 Numbers - Sum",
        code : '5 + 2'
    }, {
        name : "05 Numbers - Multiplication",
        code : '8 * 2'
    },
    // BOOLEANS
    {
        name : "06 Booleans - Comparison",
        code : '5 > 2'
    }, {
        name : "07 Booleans - Inequality",
        code : '"foo" != "foo"'
    },
    // VARIABLES
    {
        name : "08 Variables - Total",
        code : 'total := 2 + 1\ntotal * 3'
    }, {
        name : "09 Variables - Square",
        code : 'num := 4\nsquare := num * num\nsquare - 1'
    },
    // LOADING DATA
    {
        name : "10 Loading Data",
        code : '//payments'
    },
    // FILTERED DESCENT
    {
        name : "11 Filtered Descent - Date",
        code : 'payments := //payments\npayments.date'
    }, {
        name : "12 Filtered Descent - Index",
        code : 'payments := //payments\npayments.recipients[0]'
    },
    // REDUCTIONS
    {
        name : "13 Reductions - Count",
        code : 'count(//payments)'
    }, {
        name : "14 Reductions - Mean",
        code : 'mean(//payments.amount)'
    }, {
        name : "15 Reductions - Sum",
        code : 'sum(//payments.amount)'
    },
    // IDENTITY MATCHING
    {
        name : "16 Identity Matching",
        code : 'orders := //orders\norders.subTotal + orders.subTotal * orders.taxRate + orders.shipping + orders.handling'
    },
    // VALUES
    {
        name : "17 Values",
        code : 'payments := //payments\npayments.amount * 0.10'
    },
    // FILTERING
    {
        name : "18 Filtering - Payments",
        code : 'payments := //payments\ncount(payments where payments.amount > 10.00)'
    }, {
        name : "19 Filtering - Users",
        code : 'users := //users\nsegment := users.age > 19 & users.age < 53 & users.income > 60000\ncount(users where segment)'
    },
    // CHAINING
    {
        name : "20 Chaining",
        code : 'pageViews := //pageViews\nbound := 1.5 * stdDev(pageViews.duration)\navg := mean(pageViews.duration)\nlongPageViews := pageViews where pageViews.duration > (avg + bound)\nlongPageViews.userId'
    },
    // FULLY-APPLIED FUNCTIONS
    {
        name : "21 Fully Applied Functions",
        code : "pageViews := //pageViews\npageViewsForUser('userId) := pageViews where pageViews.userId = 'userId\npageViewsForUser(12345)"
    },
    // PARTIALLY-APPLIED FUNCTIONS, PART 1
    {
        name : "22 Partially Applied Function - Part 1",
        code : "pageViews := //pageViews\npageViewsForUser('userId) :=\n\t{userId: 'userId, meanPageView: mean(pageViews.duration where pageViews.userId = 'userId)}\npageViewsForUser"
    },
    // PARTIALLY-APPLIED FUNCTIONS, PART 2
    {
        name : "23 Partially Applied Function - Part 2",
        code : "clicks := //clicks\nviews  := //views\nclickthroughRate('page) := \n\t{page: 'page, ctr: count(clicks where clicks.pageId = 'page) / count(views where views.pageId = 'page)}\nclickthroughRate"
    },
    // AUGMENTATION
    {
        name : "24 Augmentation",
        code : 'clicks := //clicks\nclicksWithDays := clicks with {day: (std::time::dayOfYear(clicks.timeString)) }\nclicksWithDays'
    },
    // JOINS
    {
        name : "25 Joins",
        code : "customers := //customers\norders := //orders\nfractionForUser('userId) :=\n\tcustomers' := customers where customers.userId = 'userId\n\torders' := orders where orders.userId = 'userId\n\tcustomers' ~ orders'\n\torders.total / customers.income\nfractionForUser"
    },
    // SELF JOINS
    {
        name : "26 Self-Joins",
        code : "users  := //users\nusers' := new users\nusers ~ users'\n{ location: users.location.state,  income: users.income }"
    }];

    var map = {};
    for(var i = 0; i < values.length; i++) {
        map[utils.normalizeQueryName(values[i].name)] = values[i];
    }
    return map;
});