#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){
// Q1
int a;
cin>>a;
int c;
for(int i = 0; i<=a; i){
    c=a%10;
    cout<<c<<"\n";
    a=a/10;
}

// // Q2
// int a;
// cin>>a;
// int b=0;
// int c;
// for(int i = 0; i<a; i){
//     c=a%10;
//     cout<<c<<"\n";
//     b=b+c;
//     a=a/10;
// }
// cout<<"Total of each digit is: ";
// cout<<b;

}