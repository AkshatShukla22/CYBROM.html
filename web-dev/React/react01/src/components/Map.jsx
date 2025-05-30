import React from 'react';
import MapDta from './MapDta';
import student from './MapDta';
import MapDta2 from './MapDta2';

const Map = () => {

    // const name = ['Akshat', 'Mohit', 'Hritik', 'Chetan', 'Pranavh', 'Irfan'];
    // const ans = name.map((name,index)=>{
    //     return (
    //       <>
    //           <h1>{name}</h1>
    //       </>
    //     );
    // });
    // return<>{ans}</>

    // let student = [
    //     {
    //         name: "Akshat Shukla",
    //         age: 21,
    //     },
    //     {
    //         name: "Irfan Lohar",
    //         age: 21,
    //     },
    //     {
    //         name: "Chetan Doniwal",
    //         age: 21,
    //     },
    //     {
    //         name: "Hritik Shukla",
    //         age: 22,
    //     }
    // ]
    // const ans = student.map((key)=>{
    //     return(
    //         <>
    //         <tr>
    //             <td>{key.name}</td>
    //             <td>{key.age}</td>
    //         </tr>
    //         </>
    //     )
    // })
    // return(
    //     <>
    //     <table border={1}>
    //         <tr>
    //             <th>Name</th>
    //             <th>Age</th>
    //         </tr>
    //         <tbody>
    //             {ans}
    //         </tbody>
    //     </table>
    //     </>
    // )

    // const ans = student.map((key)=>{
    //     return(
    //         <>
    //         <tr>
    //             <td>{key.name}</td>
    //             <td>{key.age}</td>
    //         </tr>
    //         </>
    //     )
    // })
    // return(
    //     <>
    //     <table border={1}>
    //         <tr>
    //             <th>Name</th>
    //             <th>Age</th>
    //         </tr>
    //         <tbody>
    //             {ans}
    //         </tbody>
    //     </table>
    //     </>
    // )

    // return(
    //     <>
    //     <table border={1}>
    //         <tr>
    //             <th>Name</th>
    //             <th>Age</th>
    //         </tr>
    //         <tbody>
    //             <MapDta />
    //         </tbody>
    //     </table>
    //     </>
    // )

    const ans = student.map((key)=><MapDta2 
    nm={key.name}
    age = {key.age}
/>)
    return(
        <>
        <table border={1}  style={{margin: "auto",}}>
            <tr>
                <th>Name</th>
                <th>Age</th>
            </tr>
            <tbody>
                {ans}
            </tbody>
        </table>
        </>
    )

};

export default Map;
