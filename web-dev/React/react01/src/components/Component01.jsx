import React from 'react';
import Component02 from './Component02';

const Component01 = ({user}) => {
  return (
    <>
      <h1>Component 01</h1>
      {/* <Component02 user={user}/> */}
      <Component02 />
    </>
  );
}

export default Component01;
