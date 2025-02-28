#include<iostream>
// #include<limits>
using namespace std;

int main(){

    int a = 5;
    int b;
    int c;
    cin>>c;
    // b == c;
    // cout<<"enter number";
    // int b;
    // cin>>b;

    // (c == 1)? cout<< a*b : ( c == 2) ? cout<<a/b : cout<<"invalid";

    (c == a)? cout<<"matched" : cout<<"invalid try again",
    cin>>b,
    (b == a)? cout<<"matched" : cout<<"invalid try again" ;

}
