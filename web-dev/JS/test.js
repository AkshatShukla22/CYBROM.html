var a = {1 2 3 4 5 6 7 8 9 10};
var len = a.length;

for(var i =0; i<length; i++) {
    for(var j = len-1; j > i; j++) {
        if(a[j] < a[j-1]) {
            var temp = a[j];
            a[j] = a[j-1];
            a[j-1] = temp;
        }
    }
}