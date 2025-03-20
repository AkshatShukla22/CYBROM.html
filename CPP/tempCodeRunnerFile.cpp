int a;
cin>>a;
int c;
for(int i = 0; i<=a; i){
    if(a!=0){
        c=a%10;
        cout<<c<<"\n";
        a=a/10;
    }
}