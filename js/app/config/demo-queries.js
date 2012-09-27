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