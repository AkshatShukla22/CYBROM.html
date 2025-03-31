#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){

    int a [5] = {1,2,3,4,5};
    int b [] = {6,7,8,9,0};
    int c [] = {};

    for(int i = 0; i<=4; i++){
        cout<<a[i]<<" ";
    }
    cout<<endl;

    for(int i = 0; i<=4; i++){
        cin>>c[i];
    }
    for(int i = 0; i<=4; i++){
        cout<<c[i]<<" ";
    }
}