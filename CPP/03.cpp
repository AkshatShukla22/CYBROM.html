#include <iostream>
using namespace std;

int main(){
    int a;
    cin>>a;
    // char b;
    // cin>>b;

    // if( a>='A' && a<='Z' || a>='a' && a<='b' ){
    //     cout<<"matched";
    // }
    // else{
    //     cout<<"try again";
    // }

    // if( a>='A' && a<='Z')
    //         cout<<"upper case";
    
    // else if(a>='a' && a<='b')
    //     cout<<"lower case";
    
    // else
    //     cout<<"invalid";   

    // if(a == 1 || a==3 || a== 5 || a==7 || a==10 || a==12){
    //     cout<<"31 Days";
    // }
    // else if(a == 4 || a==6 || a== 8 || a==9 || a==11) {
    //     cout<<"30 days";
    // }
    // else{
    //     cout<<"28 days";
    // }
    
    if(a%2 != 0){
        cout<<"31 Days";
    }
    else if(a==2) {
        cout<<"28 days";
    }
    else{
        cout<<"30 days";
    }
    
}