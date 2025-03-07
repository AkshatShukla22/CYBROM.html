#include <iostream>
using namespace std;

int main(){
    int a;
    int b;
    cout<<"enter nambers";
    cin>>a;
    cin>>b;
    char c;
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

    switch (c)
    {
    case '+':
        cout<<a+b;
        break;
    case '-':
        cout<<a-b;
        break;
    case '*':
        cout<<a*b;
        break;
    case '/':
        cout<<a/b;
        break;
    case '%':
        cout<<a%b;
        break;
    default:
        cout<<"invalid";
        break;
    }

    if(a==0){
            cout<<"Sunday";
        }
    else if(c=='-'){
            cout<<a+b;
        }
    else if(c=='-'){
            cout<<a-b;
        }
    else if(c=='*'){
            cout<<a*b;
        }
    else if(c=='/'){
            cout<<a/b;
        }
    else if(c=='%'){
            cout<<a%b;
        }
    else{
            cout<<"Invalid";
        }
}