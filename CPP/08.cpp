#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){

    // int a [5] = {1,2,3,4,5};
    // int b [] = {6,7,8,9,0};
    // int c [] = {};

    // for(int i = 0; i<=4; i++){
    //     cout<<a[i]<<" ";
    // }
    // cout<<endl;

    // for(int i = 0; i<=4; i++){
    //     cin>>c[i];
    // }
    // for(int i = 0; i<=4; i++){
    //     cout<<c[i]<<" ";
    // }

    //For-each loop:

    // int a[] = {1,2,3,4,5};
    // for(int x: a){
    //     cout<<x<<" ";
    // }
    // for(auto x: a){
    //     cout<<x<<" ";
    // }

    // int n = sizeof(a) / sizeof(a[0]);
    // cout<<n;

    // int n;
    // cin>>n;
    // int a[n];
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // for(auto x:a){
    //     cout<<x<<" ";
    // }

    // Sum of all elements in array
    // int n;
    // cin>>n;
    // int a [n];
    // int sum = 0;
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // for(int i = 0; i<n; i++){
    //     sum = sum + a[i];
    // }
    // cout<<sum;

    // Largest
    // int n;
    // cin>>n;
    // int a[n];
    // int b;
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // b = a[0];
    // for(int i = 1; i<n; i++){
    //     if(b<a[i]){
    //         b = a[i];
    //     }
    // }
    // cout<<b;

    // Q1. Second Largest
    // int n;
    // cout<<"Enter the size of array: ";
    // cin>>n;
    // int a[n];
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // int b = a[0];
    // int c;
    // for(int i = 1; i<n; i++){
    //     if(b<a[i]){
    //         c=b;
    //         b=a[i];
    //     }
    //     else if(a[i]<b && a[i]>c){
    //         c=a[i];
    //     }
    // } 
    // cout<<endl;
    // cout<<"second largest is: "<<c;

    // Q2. Reverae the array
    // int n;
    // cout<<"Enter the size of array: ";
    // cin>>n;
    // int a[n];
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // int b = 0; int c = n-1;
    // while(b<c){
    //     int temp = a[b];
    //     a[b] = a[c];
    //     a[c] = temp;
    //     b++;
    //     c--;
    // }
    // cout<<endl;
    // for(int i =0; i<n; i++){
    //     cout<<a[i]<<" ";
    // }
    
    // Q3.
    // int n;
    // cout<<"Enter the size of array: ";
    // cin>>n;
    // int a[n];
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // int pos = 0;
    // int neg = 0;
    // for(int i = 0; i<n; i++){
    //     if(a[i]>0){
    //         pos++;
    //     }
    //     else if(a[i]<0){
    //         neg++;
    //     }
    // } 
    // cout<<endl;
    // cout<<"Positive: "<<pos<<endl;
    // cout<<"Negative: "<<neg<<endl;

    //Q. Sort an array in assending order
    int n;
    cout<<"Enter the size of array: ";
    cin>>n;
    int a[n];
    for(int i = 0; i<n; i++){
        cin>>a[i];
    }
    int temp;
    for(int i = 0; i<n; i++){
        for(int j = i+1; j<n; j++){
            if(a[i]>a[j]){
                temp = a[i];
                a[i] = a [j];
                a[j] = temp;
            }
        }
    }

    for(int i = 0; i<n; i++){
        cout<<a[i]<<" ";
    }

}