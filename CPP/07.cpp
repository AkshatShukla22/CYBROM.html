#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main(){

// Q1.
// int num1, num2, max, lcm;

//     cout << "Enter two numbers: ";
//     cin >> num1 >> num2;

//     max = (num1 > num2) ? num1 : num2;

//     while (true) {
//         if (max % num1 == 0 && max % num2 == 0) {
//             lcm = max;
//             break;
//         }
//         max++;
//     }
//     cout << "LCM of " << num1 << " and " << num2 << " is " << lcm << endl;


// Q2.
// int num1, num2, hcf;
//     cout << "Enter two numbers: ";
//     cin >> num1 >> num2;
//     for (int i = 1; i <= num1 && i <= num2; i++) {
//         if (num1 % i == 0 && num2 % i == 0) {
//             hcf = i;
//         }
//     }
//     cout << "HCF of " << num1 << " and " << num2 << " is " << hcf << endl;

// Q3.
// int a;
// cin>>a;
// int b=0, c=1;
// for(int i=0; i<=a; i++){
//     cout<<b<<" ";
//     int d=b+c;
//     b=c;
//     c=d;
// }

// Q4.
// int num, originalNum, digit, sum = 0;
//     cout << "Enter a number: ";
//     cin >> num;

//     originalNum = num; 

//     while (num > 0) {
//         digit = num % 10;
//         int factorial = 1;
//         for (int i = 1; i <= digit; i++) {
//             factorial *= i;
//         }

//         sum += factorial;
//         num /= 10;
//     }
//     if (sum == originalNum) {
//         cout << originalNum << " is a Strong Number." << endl;
//     } else {
//         cout << originalNum << " is not a Strong Number." << endl;
//     }

// Q5.
// int a;
// cin>>a;
// while(a>=10){
//     int b = 0;
//     while (a>0){
//         b = b+(a%10);
//         a =  a/10;
//     }
//     a=b;
// }
// cout<<a;

// Q6.
// int n;
// cin>>n;
// double b=0, c=0;

// for(int i=1; i<=n; i++){
//     double distance, fuel;
//     cout<<"Enter Distance traveled and fuel used "<<i<<": ";
//     cin>>distance>>fuel;

//     b=b+distance;
//     c=c+fuel;
// }

// if(b==0){
//     cout<<"furl usage can't be zero."<<endl;
// }
// else{
//     double milege = b/c;
//     cout<<fixed<<setprecision(2);
//     cout<<"Avg. Milege: "<<milege<<" km/l"<<endl;
// }

// Q8.
// int a, b;
//     cin >> a >> b;
//     int c;

//     for (; a <= b; a++) {
//         c = 0;

//         for (int i = 2; i < a; i++) {
//             if (a % i == 0) {
//                 c++;
//                 break;
//             }
//         }

//         if (c == 0 ) {
//             cout << a;
//             break; 
//         }
//     }

// Q9.
// int a;
// cin>>a;
// if(a>=60){
//     if(a>=90){
//         cout<<"Grade: A";
//     }
//     else if(a>=80){
//         cout<<"Grade: B";
//     }
//     else{
//         cout<<"Grade: C";
//     }
// }
// else{
//     cout<<"Grade: D";
// }

// Q10.
// int a;
// cin>>a;
// switch (a)
// {
// case 1:
//     cout<<"I";
//     break;
// case 2:
//     cout<<"II";
//     break;
// case 3:
//     cout<<"III";
//     break;
// case 4:
//     cout<<"IV";
//     break;
// case 5:
//     cout<<"V";
//     break;
// case 6:
//     cout<<"VI";
//     break;
// case 7:
//     cout<<"VII";
//     break;
// case 8:
//     cout<<"IIX";
//     break;
// case 9:
//     cout<<"IX";
//     break;
// case 10:
//     cout<<"X";
//     break;
// default:
//     cout<<"Number is not in the range of 1-10 ";
//     break;
// }

// Q11.
// int a;
// cin>>a;

// for(int i = 1 ; i<=a; i++){
//     for(int j = 1; j<=a; j++){
//         if(i==1 || i==a || j==1 || j==a){
//             cout<<"*";
//         }
//         else{
//             cout<<" ";
//         }
//     }
//     cout<<endl;
// }

// Q12.
// int a;
// cin>>a;
// for(int i = 1; i<=a; i++){
//     for (int j=1; j<=a-i; j++){
//         cout<<" ";
//     }
//     for(int j=1; j<=i; j++){
//         cout<<j;
//     }
//     for(int j=i-1; j>=1; j--){
//         cout<<j;
//     }
//     cout<<endl;
// }

// Q13.
// int a;
// cin>>a;
// int b = sqrt(a);
// if(b*(a/2)==a){
//     cout<<"power of 2";
// }
// else{
//     cout<<"not a power of 2";
// }

// Q14.
// int a,b,temp;
// cin>>a>>b;
// cout<<"a = "<<a<<endl;
// cout<<"b = "<<b<<endl;
// temp=a;
// a=b;
// b=temp;

// cout<<"After swapping"<<endl;
// cout<<"a = "<<a<<endl;
// cout<<"b = "<<b<<endl;

// Q15.
// int x,y;
// cout<<"Enter the value of X: ";
// cin>>x;
// cout<<"Enter the value of Y: ";
// cin>>y;
// if(x>0 && y>0){
//     cout<<"1st Quadrant";
// }
// else if(x<0 && y>0){
//     cout<<"2nd Quadrant";
// }
// else if(x<0 && y<0){
//     cout<<"3rd Quadrant";
// }
// else if(x>0 && y<0){
//     cout<<"4th Quadrant";
// }
// else{
//     cout<<"not in range";
// }

// Q16.
// int a,b,c;
// cin>>a>>b>>c;
// if(a+b>c && b+c>a && a+b>b){
//     cout<<"valid triangle";
// }
// else{
//     cout<<"not a valid triangle";
// }

int a = 1;
while(a==10);
{
    cout<<a;
    a++;
}

// if(9){
//     cout<<"hello";
// }
// else{
//     cout<<"bye";
// }

// if(0,2,9){
//     cout<<"A";
// }

}