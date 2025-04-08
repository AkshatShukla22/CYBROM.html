#include<bits/stdc++.h>
using namespace std;
int main(){

// Static type ---->>>    
    // int a[3][2]={1,2,3,4,5,6}; 
    // int a[2][3]={{1,2,3},{4,5,6}}; 
    // for(int i=0;i<2;i++){
    //     for(int j=0;j<3;j++){
    //         cout<<a[i][j]<<" ";
    //     }
    //     cout<<endl;
    // }

//Dynamic type --->>>
    // int m ,n;
    // cout<<"Enter size of row and column of 2d array";
    // cin>>m>>n;
    // int a[m][n];


    // for(int i=0;i<m;i++){
    //     for(int j=0;j<n;j++){
    //         cin>>a[i][j];
    //     }
    // } 
    //  for(int i=0;i<m;i++){
    //     for(int j=0;j<n;j++){
    //         cout<<a[i][j]<<" ";
    //     }
    //     cout<<endl;
    // }


//Addition of two matrix ---->>    
       int m ,n;
       cout<<"Enter size of array";
       cin>>m>>n;
       int a[m][n];
       int b[m][n];

    cout<<"Enter elements of row and column of 2d array1";
    for(int i=0;i<m;i++){
        for(int j=0;j<n;j++){
            cin>>a[i][j];
        }
    } 
    
    cout<<"Enter elements of row and column of 2d array2";
    for(int i=0;i<m;i++){
        for(int j=0;j<n;j++){
            cin>>b[i][j];
        }
    } 

    int sum = 0;
    for(int i=0;i<m;i++){
        for(int j=0;j<n;j++){
            sum = a[i][j]+b[i][j];
            cout<<sum<<" ";
        }
        cout<<endl;
    }

    
    

 
}