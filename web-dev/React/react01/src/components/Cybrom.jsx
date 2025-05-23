import React from 'react';

const Cybrom = (props) => {
  return (
    <>
      <h1>Name: {props.nm}</h1>
      <h1>City: {props.city}</h1> 
      <h1>Address: {props.address}</h1>
      <h1>Fees: {props.fs}</h1>
    </>
  );
}

export default Cybrom;
