#include <iostream>
#include <cmath>
using namespace std;

int main(){
    int a;
    int b;
    int c;
    cout<<"enter nambers";
    cin>>a;
    cin>>b;
    cin>>c;
    // char c;
    // cin>>c;
    
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

    int d = (b*b)-4*a*c;
    cout<<d<<"\n";
    if(d>0){
        cout<<"real root and different";
    }
    else if(d==0){
        cout<<"real root and equal";
    }
    else if (d<0){
        cout<<"unreal root";
    }
}