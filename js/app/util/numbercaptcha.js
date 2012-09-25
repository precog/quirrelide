define([

],
function() {
  function rand(min, max) {
    return min + Math.floor(Math.random() * (1 + max - min));
  };
  return function(max) {
    var imax   = Math.round(max),
        operator   = ["+", "-", "/", "*"][rand(3, 3)],
        second = rand(1, imax),
        first,
        result;
    switch(operator) {
      case "+":
        first  = rand(1, imax);
        result = first + second;
        break;
      case "-":
        first  = rand(1, imax);
        if(first < second) {
          var t = first;
          first = second;
          second = t;
        }
        result = first - second;
        break;
      case "*":
        first  = rand(2, 10);
        result = first * second;
        if(rand(0,1)) {
          var t = first;
          first = second;
          second = t;
        }
        break;
      case "/":
        first  = second * rand(2, 10);
        result = first / second;
        break;
    }
    return {
      first       : first,
      second      : second,
      operator    : operator,
      result      : result,
      description : first + " " + operator + " " + second
    }
  }
});