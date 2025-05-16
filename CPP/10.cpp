#include<bits/stdc++.h>
using namespace std;
int main(){
    // int n;
    // cout<<"Enter the size of array: ";
    // cin>>n;
    // int a[n];
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // int d = 0;
    // for(int i = 0; i<n; i++){
    //     int c = 0;
    //     for(int j = 0; j<n; j++){
    //         if(a[i]==a[j]){
    //             c++;
    //             d++;
    //         }
    //     }
    //     if(c>n/2){
    //         cout<<a[i]<<endl;
    //         break;
    //     }
    // }
    // if(d!=0){
    //     cout<<"no";
    // }


    // leetcpde problem: 238
    // int n;
    // cout<<"Enter the size of array: ";
    // cin>>n;
    // int a[n];
    // for(int i = 0; i<n; i++){
    //     cin>>a[i];
    // }
    // for (int i = 0; i<n; i++){
    //     int c = 1;
    //     for(int j = i+1; j<n; j++){
    //         c=c*a[j];
    //     }
    //     for(int j = i-1; j>=0; j--){
    //         c=c*a[j];
    //     }
    //     cout<<c<<" ";
    // }

    // Q. leetCode problem 896
    // int n;
    // cout << "Enter the size of array: ";
    // cin >> n;
    // int a[n];
    // for (int i = 0; i < n; i++) {
    //     cin >> a[i];
    // }

    // int d = 0;
    // int c = 0;
    // int e = 0;
    // int temp = a[0];
    // for(int i = 1; i < n; i++) {
    //     if(a[i] != a[i - 1]) {
    //         if(a[i] > a[i - 1]) d = 1;
    //         break;
    //     }
    // }
    // for(int i = 1; i < n; i++) {
    //     if(d==1){
    //         e = 1;
    //         if(a[i]!=a[i-1]){
    //             temp++;
    //             if(a[i]!=temp){
    //                 c++;
    //             }
    //         }
    //     }
    //     else{
    //         if(a[i]!=a[i-1]){
    //             temp--;
    //             if(a[i]!=temp){
    //                 c++;
    //             }
    //         }
    //     }
    // }
    // if(c == 0) {
    //     if(e==1){
    //     cout << "Array is incresing and continuous monotonic" << endl;
    //     }
    //     else{
    //     cout << "Array is decreasing and continuous monotonic" << endl;
    //     }
    // } else {
    //     cout << "Array is not continuous monotonic" << endl;
    // }

    // Q. leetcode problem 121
    // int n;
    // cout << "Enter the size of array: ";
    // cin >> n;

    // int a[n];
    // for (int i = 0; i < n; i++) {
    //     cin >> a[i];
        
    // }
    // int min = a[0];
    // int profit = 0;
    // for(int i = 1; i < n; i++){
    //     if(a[i]>min){
    //         profit = a[i] - min;
    //     }
    //     else{
    //         min = a[i];
    //     }
    // }
    // cout<<"prfot: "<<profit;
   
    //Leetcode Q34
    // int n;
    // cout << "Enter the size of array: ";
    // cin >> n;

    // int a[n];
    // for (int i = 0; i < n; i++) {
    //     cin >> a[i];
    // }
    // int target;
    // int c = 0;
    // int b;
    // cout<<"enter target:";
    // cin>>target; 
    // int first = -1;
    // int last = -1;
    // for (int i = 0; i < n; i++) {
    //     if(a[i]==target){
    //         first = target;
    //         last = target;
    //         if(c==0){
    //             cout<<"target found at:"<<i<<endl;
    //             c++;
    //         }
    //         if(a[i+1]!=target){
    //             cout<<"target found at:"<<i<<endl;
    //         }
    //     }
    // }
    
    // if(c==0){
    //     cout<<first<<" "<<last;
    // }


    //leet code questio 01
    // int n;
    // cout << "Enter the size of array: ";
    // cin >> n;

    // int a[n];
    // for (int i = 0; i < n; i++) {
    //     cin >> a[i];
    // }
    // int target;
    // int c = 0;
    // int b;
    // cout<<"enter target:";
    // cin>>target; 
    // for(int i=0;  i<n; i++){
    //      for(int j=i+1;  j<n; j++){
    //         if(a[i]+a[j]==target){
    //             c=i;
    //             b=j;
    //         }
    //     }
    // }
    // cout<<"target foud at: "<<c<<" and "<<b<<endl;


    // paneldrome
    int a;
    cin >> a;
    int rev = 0;
    int b = a;
    while (b > 0) {
        int c = b % 10;
        rev = (rev * 10) + c;
        b = b / 10;
    }
    if (rev == a) {
        cout << "palindrome";
    } else {
        cout << "not a palindrome";
    }
}
    