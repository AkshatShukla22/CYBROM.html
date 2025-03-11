#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){
    int a=1;
    int b;
    cin>>b;
    int c=1;
    // cin>>c;
    
    //while loop
    // while (a<=b)
    // {
    //     cout<<a*3<<endl;
    //     a++;
    // }

    // while (c<=b)
    // {
    //     a=a+c;
    //     c++;
    // }
    // cout<<a;

    // do while
    do
    {
        a=a*c;
        c++;
    } while (c<=b);
    cout<<a;
    
}