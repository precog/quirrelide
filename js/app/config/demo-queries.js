define([
    "app/util/utils"
],

function(utils) {
    var values = [{
        name : "Income By State",
        code : '-- This query will return the State(s) with the highest average income\n\nusers := //users -- assigns the user data to a variable called "users"\n\nincomeByState := forall \'location\n\t\t{location: \'location, mean : mean(users.income where users.location = \'location)}\n-- These two lines determine the average income of each state by using the mean function within a forall statement\n\nincomeByState where incomeByState.mean = max(incomeByState.mean)\n-- returns the results filtered by a \'where\' condition, in this case: States that have the max average income'
    }, {
        name : "Taxes By User",
        code : '-- This query creates a tax variable and adds it to the orders dataset, it then uses this variable to return the users who pay above some threshold in taxes\n\norders := //orders -- assigns the orders data to a variable called \"orders\"\nthreshold := 1 -- creates a variable called threshold, set to 1\n\nordersWithTax := orders with {tax: orders.taxRate*orders.total} -- adds a new variable called tax to the orders data set\n\ntaxByUser := forall \'userId\n\t\t{userId : \'userId, sum: sum(ordersWithTax.tax where ordersWithTax.userId = \'userId)}\n-- These two lines sum the tax for all users\n\ntaxByUser where taxByUser.sum > threshold -- returns the results filtered by those greater than the threshold'
    }, {
        name : "Conversion Rate",
        code : '-- This query returns conversions per hour from clicks data\n-- Check out the chart option for displaying data\n\nclicks := //clicks -- assigns clicks data to a variable called \"clicks\"\nconversionRate := 0.045 -- creates a conversion rate variable that can be easily modified\n\nclicksWithHour := clicks with {hour: (std::time::hourOfDay(clicks.timeString))}\n-- adds an hour variable created using the hourOfDay function to the clicks data and stores it in clicksWithHour\n\nforall \'hour\n{hour: \'hour, conversions: count(clicksWithHour where clicksWithHour.hour = \'hour)*conversionRate}\n-- calls the count function and multiplies the counted clicks by the conversion rate and returns the results unfiltered for all hours.  When filtering results from forall queries it is useful to assign the forall statement to a variable. See other queries for examples.'
    }, {
        name : "Simple Filtering",
        code : '-- This query is designed to show some basic filtering using the dot operator and the where command\n-- In order to see the results of the different levels of filtering uncomment a line and hit shift+enter to run the query, to see a different line, recomment the previous line using -- and uncomment another.  Note that no results will appear without uncommenting one of the lines.\n\ntransaction := //transaction\n\n-- transaction -- returns all the data\n-- transaction.timestamp -- returns just the timestamp data\n-- transaction.timestamp.time-- filters even further and returns just the time set from transaction.time\n-- transaction.timestamp.time where transaction.timestamp.date > 3 -- filters the previous line using a where filter to return only the results where the data is greater than 3'
    }, {
        name : "Movie Ratings",
        code : '-- This query takes movie ratings, creates an overall rating and returns the top x results\n\ndata := //movie_ratings -- assigns the movie_ratings data to a variable called \"data\"\nnumberOfRecommendations := 10 -- creates a variable that determines how many rankings are returned\nhighestRating := max(data.rating) -- the rating of the highest rated movie, for use below \n\nrecommendation := forall \'movie -- will apply the following code  to each movie\n{movie: \'movie, overallRating: (mean(data.rating where data.movie = \'movie)- stdDev(data.rating where data.movie = \'movie))+ (min(data.rating where data.movie = \'movie)/highestRating)}\n-- The ratings are composed by taking the average rating, subtracting the standard deviation (to reward consistent movies) and adding the ratio of the minimum rating over the highest possible rating (to reward movies that are not disliked by anyone)\n\nrank := std::stats::rank(recommendation.overallRating) -- ranks the overall movie ratings and stores it in \'rank\'\nmaxRank := max(rank) -- the highest rank (higher ranks are higher numbers, i.e. 1st is the lowest rank)\n\nrecommendation where rank > maxRank - numberOfRecommendations'
    }];

    var map = {}, prefix = "examples/";
    for(var i = 0; i < values.length; i++) {
        var name = prefix+values[i].name;
        map[utils.normalizeQueryName(name)] = {
            name : name,
            code : values[i].code
        };
    }
    return map;
});