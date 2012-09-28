define([
    "app/util/utils"
],

function(utils) {
    var values = [{
        name : "examples/summer games medals/Medals By Country",
        code : "data := //summer_games/london_medals\nbyCountry := solve 'Country\n  {country: 'Country,\n   total: sum(data.Total where data.Country = 'Country)}\nbyCountry"
    }, {
        name : "examples/summer games medals/Attributes By Sport",
        code : "data := //summer_games/london_medals\n solve 'Sport \n  data' := data where data.Sport = 'Sport\n  {sport: 'Sport, \n  aveAge: mean(data'.Age),\n  aveWeight: mean(data'.Weight ),\n  aveHeight: mean(data'.HeightIncm)}"
    }, {
        name : "examples/summer games medals/Age Distribution Of Medals",
        code : "london := //summer_games/london_medals\nsolve 'age\n  {age: 'age, medalWinnersByAge: count(london where london.Age = 'age)}"
    },{
        name : "examples/summer games medals/Correlation of Letters in Name and Medals",
        code : "data := //summer_games/london_medals \nbyCountry := solve 'Country\n  data' := data where data.Country = 'Country\n  {country: 'Country,\n  gold: sum(data'.G ),\n  silver: sum(data'.S ),\n  bronze: sum(data'.B ),\n  total: sum(data'.Total ),\naveLettersInName: mean(std::string::length(data'.Name))}\n\nstd::stats::corr(byCountry.aveLettersInName,byCountry.total)"
    }, {
        name : "examples/summer games medals/Percentage of Female Athletes by Country",
        code : "data := //summer_games/london_medals\nbyCountry := solve 'Country\n data' := data where data.Country = 'Country\n  {country: 'Country,\n  percentWomen: sum(data'.Total where data'.Sex = \"F\")\n  /sum(data'.Total ),\n  total: sum(data'.Total)}\n\nfiltered := byCountry where byCountry.total >=5\n\nfiltered where std::stats::rank(neg filtered.percentWomen) <= 5"
    }, {
        name : "examples/summer games athletes/Athletes By Country",
        code : "data := //summer_games/athletes \nsolve 'Countryname \n  {CountryName: 'Countryname, count: count(data where data.Countryname = 'Countryname)}"
    }, {
        name : "examples/summer games athletes/Athletes By Sport",
        code : "data := //summer_games/athletes \nsolve 'Sportname \n  {Sportname: 'Sportname, count: count(data where data.Sportname = 'Sportname)}"
    }, {
        name : "examples/summer games athletes/Top US Sports - Men",
        code : "data := //summer_games/athletes \nUSMaleAthletes := data where data.Countryname = \"US\" & data.Sex = \"M\" \nbySport := solve 'Sportname \n  {sport: 'Sportname, numberOfAthletes: count(USMaleAthletes where USMaleAthletes.Sportname = 'Sportname)} \nrank := std::stats::rank(bySport.numberOfAthletes) \nbySport where rank > max(rank) - 10"
    }, {
        name : "examples/summer games athletes/Top US Sports - Women",
        code : "data := //summer_games/athletes \nUSFemaleAthletes := data where data.Countryname = \"US\" & data.Sex = \"F\" \nbySport := solve 'Sportname \n  {sport: 'Sportname, numberOfAthletes: count(USFemaleAthletes where USFemaleAthletes.Sportname = 'Sportname)} \nrank := std::stats::rank(bySport.numberOfAthletes) \nbySport where rank > max(rank) - 10"
    }, {
        name : "examples/summer games athletes/Percentage of Female Athletes",
        code : "data := //summer_games/athletes \npercentageFemaleAthletesByCountry := solve 'Countryname \n  {country: 'Countryname,\n  percentFemale: 100*count(data where data.Sex = \"F\" & data.Countryname = 'Countryname)/count(data where data.Countryname = 'Countryname)}\n \nrank := std::stats::rank(neg percentageFemaleAthletesByCountry.percentFemale)\n \npercentageFemaleAthletesByCountry where rank <=5"
    }, {
        name : "examples/tutorial/Top Five Products",
        code : "data := //tutorial/transactions\n\nsalesByProduct := solve 'product\n  {product: 'product,\n  sales: sum(data.total where data.ApocalypseProducts = 'product)}\nrank := std::stats::rank(neg salesByProduct.sales)\n\nsalesByProduct where rank <= 5"
    }, {
        name : "examples/tutorial/Top Five Products Plus Other",
        code : "data := //tutorial/transactions\n\nsalesByProduct := solve 'ApocalypseProducts\n  {product: 'ApocalypseProducts,\n  sales: sum(data.total where data.ApocalypseProducts = 'ApocalypseProducts)}\nrank := std::stats::rank(neg salesByProduct.sales)\notherProducts := {product: \"other\",sales: sum(salesByProduct.sales where rank > 5)}\n\ntop5Products := salesByProduct where rank <= 5\nallProducts := (new otherProducts) union top5Products \nallProducts"
    }, {
        name : "examples/tutorial/Quantity By Month",
        code : "data := //tutorial/transactions\ntoday := 233\ndataWithMonthAndYearAndDay := data with\n  {month: std::time::monthOfYear(data.timeStamp),\n  year: std::time::year(data.timeStamp),\n  day: std::time::dayOfYear(data.timeStamp)}\n\nquantityByMonth := solve 'month\n monthData := dataWithMonthAndYearAndDay where dataWithMonthAndYearAndDay.month = 'month\n  {month : 'month,\n  quantity: sum(monthData.quantity),\n  year : monthData.year,\n  day : monthData.day}\n\ndistinct({quantity: quantityByMonth.quantity, month: quantityByMonth.month} where\n  quantityByMonth.year=2012 & quantityByMonth.day < today)"
    }, {
        name : "examples/tutorial/Sales By Source at a Particular Hour",
        code : "data := //tutorial/transactions\ndataWithHour := data with {hour: std::time::hourOfDay(data.timeStamp)}\n\naveSalesByHour :=solve 'source\n  {source : 'source,\n  averageSales: sum(dataWithHour.total where dataWithHour.source ='source),\n  hour : dataWithHour.hour}\n\n distinct(aveSalesByHour where aveSalesByHour.hour = 13)"
    }, {
        name : "examples/clickstream/Clicks By Gender And Week",
        code : "import std::time::*\n\n clicks := //clicks\n clicks' := clicks with {week: weekOfYear(clicks.timeStamp)}\n\nclicksByGenderAndWeek := solve 'gender, 'week\n  {week: 'week,\n  gender: 'gender,\n  clicks: count(clicks' where clicks'.customer.gender = 'gender & clicks'.week = 'week)}\n clicksByGenderAndWeek"
    }, {
        name : "examples/clickstream/Clicks By Referral",
        code : "clicks := //clicks\n\nclicksByReferral := solve 'referral\n  {referral: 'referral,\n  clicks: count(clicks where clicks.marketing.referral = 'referral)}\n\nclicksByReferral"
    }];

    var map = {};
    for(var i = 0; i < values.length; i++) {
        var name = values[i].name;
        map[utils.normalizeQueryName(name)] = {
            name : name,
            code : values[i].code
        };
    }
    return map;
});