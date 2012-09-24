define([
    "app/util/utils"
],

function(utils) {
    var values = [{
        name : "examples/summer games medals/Medals By Country",
        code : "data := //summer_games/londonMedals\nbyCountry := solve 'Country\n  {country: 'Country,\n   total: sum(data.Total where data.Country = 'Country)}\nbyCountry"
    }, {
        name : "examples/summer games medals/Attributes By Sport",
        code : "data := //summer_games/londonMedals\nbySport := solve 'Sport \n  {sport: 'Sport, \n   aveAge: mean(data.Age where data.Sport = 'Sport),\n   aveWeight: mean(data.Weight where data.Sport = 'Sport),\n   aveHeight: mean(data.HeightIncm where data.Sport = 'Sport)}\nbySport"
    }, {
        name : "examples/summer games medals/Correlation of Letters in Name and Medals",
        code : "data := //summer_games/londonMedals\nbyCountry := solve 'Country\n  { country: 'Country,\n   gold: sum(data.G where data.Country = 'Country),\n   silver: sum(data.S where data.Country = 'Country),\n   bronze: sum(data.B where data.Country = 'Country),\n   total: sum(data.Total where data.Country = 'Country),\n   aveLettersInName: mean(std::string::length(data.Name where data.Country = 'Country))}\nstd::stats::corr(byCountry.aveLettersInName,byCountry.total)"
    }, {
        name : "examples/summer games medals/Percentage of Female Athletes by Country",
        code : "data := //summer_games/londonMedals\nbyCountry := solve 'Country\n  { country: 'Country,\n   percentWomen: sum(data.Total where data.Sex = \"F\" & data.Country = 'Country)\n   /sum(data.Total where data.Country = 'Country),\n   total: sum(data.Total where data.Country = 'Country)}\nfiltered := byCountry where byCountry.total >=5\nfiltered where std::stats::rank(neg filtered.percentWomen) <= 10"
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
        code : "data := //summer_games/athletes \npercentageFemaleAthletesByCountry := solve 'Countryname \n  {country: 'Countryname, percentFemale: 100*count(data where data.Sex = \"F\" & data.Countryname = 'Countryname)/count(data where data.Countryname = 'Countryname)}\n \nrank := std::stats::rank(percentageFemaleAthletesByCountry.percentFemale)\n \npercentageFemaleAthletesByCountry where rank > max(rank) - 5"
    }, {
        name : "examples/summer games athletes/Lowest Athletes Per Million",
        code : "data := //summer_games/athletes \nperCapitaAthletes := solve 'Countryname \n  {country: 'Countryname, athletesPerMillion: count(data)/(data.Population/1000000) where data.Countryname = 'Countryname} \ndistinctData := distinct(perCapitaAthletes) \nrank := std::stats::rank(distinctData.athletesPerMillion) \ndistinctData where rank < min(rank) + 10"
    },{
        name : "examples/summer games athletes/Highest Athletes Per Million",
        code : "data := //summer_games/athletes \nperCapitaAthletes := solve 'Countryname \n  {country: 'Countryname, athletesPerMillion: count(data)/(data.Population/1000000) where data.Countryname = 'Countryname} \ndistinctData := distinct(perCapitaAthletes) \nrank := std::stats::rank(distinctData.athletesPerMillion) \ndistinctData where rank > max(rank) - 10"
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