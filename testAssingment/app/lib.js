/* All the function to be tested
 */

var lib = {};

lib.evenNumber = function(val){
    let ans = val % 2
    if(ans == 0){
        return true;
    } else{
        return false;
    }
};

lib.oddNumber = function(val){
    let ans = val % 2
    if(ans == 0){
        return false;
    } else{
        return true;
    }
};

lib.palindrome = function(str) {
    let arrChar = str.split("");
    let arrReversed = arrChar.reverse("");
    let wordReversed = arrReversed.join("");
    wordReversed = wordReversed.toLowerCase().replace(/[^0-9a-z]/gi, '');
    str = str.toLowerCase().replace(/[^0-9a-z]/gi, '');

    if(wordReversed == str){
        return true;
    } else{
        return false;
    }
}

module.exports = lib;