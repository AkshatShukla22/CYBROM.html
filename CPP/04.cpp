#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){
    int a;
    float b;
    float c;
    cout<<"enter nambers: ";
    cin>>a;
    cin>>b;
    // cin>>c;
    // char c;
    cin>>c;
    
    // switch (a)
    // {
    // case 0:
    //     cout<<"Sunday";
    //     break;
    // case 1:
    //     cout<<"mon";
    //     break;
    // case 2:
    //     cout<<"tue";
    //     break;
    // case 3:
    //     cout<<"wed";
    //     break;
    // case 4:
    //     cout<<"thu";
    //     break;
    // case 5:
    //     cout<<"Fri";
    //     break;
    // case 6:
    //     cout<<"sat";
    //     break;
    // default:
    //     cout<<"invalid";
    //     break;
    // }

    // switch (c)
    // {
    // case '+':
    //     cout<<a+b;
    //     break;
    // case '-':
    //     cout<<a-b;
    //     break;
    // case '*':
    //     cout<<a*b;
    //     break;
    // case '/':
    //     cout<<a/b;
    //     break;
    // case '%':
    //     cout<<a%b;
    //     break;
    // default:
    //     cout<<"invalid";
    //     break;
    // }

    // if(a==0){
    //         cout<<"Sunday";
    //     }
    // else if(c=='-'){
    //         cout<<a+b;
    //     }
    // else if(c=='-'){
    //         cout<<a-b;
    //     }
    // else if(c=='*'){
    //         cout<<a*b;
    //     }
    // else if(c=='/'){
    //         cout<<a/b;
    //     }
    // else if(c=='%'){
    //         cout<<a%b;
    //     }
    // else{
    //         cout<<"Invalid";
    //     }

    // cout<<a*(a*b);
    // int c = pow(a,b);
    // if(c%10 == 7 ){
    //     cout<<"Lucky";
    // }
    // else{
    //     cout<<"UnLucky";
    // }

    // int d = (a*(a+1))/2;
    // if(d%2 == 0){
    //     cout<<"even";
    // }
    // else{
    //     cout<<"odd";
    // }

    // if((a%400 == 0)||(a%4 == 0 && a%100 != 0)){
    //     cout<<"leap year";
    // }
    // else{
    //     cout<<"non leap year";
    // }

    // int d = (b*b)-4*a*c;
    // cout<<d<<"\n";
    // if(d>0){
    //     cout<<"real root and different";
    // }
    // else if(d==0){
    //     cout<<"real root and equal";
    // }
    // else if (d<0){
    //     cout<<"unreal root";
    // }

    // if(a<100){
    //     cout<<"no discount";
    // }
    // else if(a<500 && a>100){
    //     cout<<"10 discount";
    //     b=(a/100)*10;
    //     cout<<a-b;
    // }
    // else if(a<1000 && a>500){
    //     cout<<"15 discount";
    //     b=(a/100)*15;
    //     cout<<a-b;
    // }
    // else if(a<=1000 ){
    //     cout<<"20 discount";
    //     b=(a/100)*20;
    //     cout<<a-b;
    // }

    // cout<<fixed<<setprecision(10)<<a;

    // Q1
    // if((b%100==0)&&(a>=b)){
    //     cout<<"You can withdrawl\n"<<"your remaining amount is:"<<a-b;
    // }
    // else{
    //     cout<<"Sorry you can not withdrawl";
    // }
    
    // Q2
    // if(a>=90 && b>=75){
    //     cout<<"100 scholorship";
    // }
    // else if(a>=80 && b>=60){
    //     cout<<"60 scholorship";
    // }
    // else{
    //     cout<<"No Scholarship";
    // }

    // Q3
    // switch (a)
    // {
    // case 0:
    //     cout<<"Zero";
    //     break;    

    // case 1:
    //     cout<<"One";
    //     break;

    // case 2:
    //     cout<<"Two";
    //     break;

    // case 3:
    //     cout<<"Three";
    //     break;

    // case 4:
    //     cout<<"Four";
    //     break;

    // case 5:
    //     cout<<"Five";
    //     break;

    // case 6:
    //     cout<<"Six";
    //     break;

    // case 7:
    //     cout<<"Seven";
    //     break;

    // case 8:
    //     cout<<"Eight";
    //     break;

    // case 9:
    //     cout<<"Nine";
    //     break;
    
    // default:
    //     cout<<"Please enter a single digit number";
    //     break;
    // }

    // Q4
    // int d;
    // int c;
    // if(b<=12){
    //     d = (a/100)*50;
    //     cout<<"50% ""discount, now your price is: "<<a-d<<endl;
    //     cout<<"no. of days flight is after: ";
    //     cin>>c;
    //     int e = (a-d)-((a-d)/100)*10;
    //     if(c>=30){
    //         cout<<"you got addetional 10% ""discount now your price is: "<<e;
    //     }
    //     else{
    //         cout<<"sorry no more discount";
    //     }
    // }
    // else if(b>=60){
    //     d = (a/100)*30;
    //     cout<<"30% ""discount, now your price is: "<<a-d<<endl;
    //     cout<<"no. of days flight is after: ";
    //     cin>>c;
    //     int e = (a-d)-((a-d)/100)*10;
    //     if(c>=30){
    //         cout<<"you got addetional 10% ""discount now your price is: "<<e;
    //     }
    //     else{
    //         cout<<"sorry no more discount";
    //     }
    // }
    // else{
    //     cout<<"no discount";
    // }

    // Q5
    int d;
    if(b>5 && c>=4){
       d =(a/100)*20;
       cout<<"you got 20% bonus, which is: "<<d;
    }
    else if((b<=5 && b>=3) && c>=3){
        d = (a/100)*10;
        cout<<"you got 10% bonus, which is: "<<d;
     }
    else{
        cout<<"no bonus, work hard";
    }
}