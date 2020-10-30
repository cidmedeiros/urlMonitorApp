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

module.exports = lib;