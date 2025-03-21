#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){
// Q1
// int a;
// cin>>a;
// int c;
// for(int i = 1; i<=a; i){
//     c=a%10;
//     cout<<c<<"\n";
//     a=a/10;
// }

// Q2
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

// for(int i= 1; i<=20; i++){
//     if(i!=5 && i!=10){
//         cout<<i<<" ";
//     }
// }

// int a;
// cin>>a;
// for(int i= 1; i<=10; i++){
//         cout<<a*i<<endl;
//     }

int a; 
int b;
cin>>a>>b;
for(a; a<=b; a++){
    int c = 1;

    for(int i = 2; i<a; i++){
        if(a%i==0){
            c++;
        }
        
    }

    if(c==1){
        cout<<a<<" ";
    }
}

}