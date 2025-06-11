import React from 'react';
import { UserContext } from '../App';
import { useContext } from 'react';

// const Component05 = ({user}) => {
//   return (
//     <>
//       <h1>Component 05 - {user}</h1>
//     </>
//   );
// }

const Component05 = ({}) => {
    const {user} = useContext(UserContext);
  return (
    <>
      {/* <h1>Component 05 - {user}</h1> */}

      <h1>Component 05 - {user}</h1>
    </>
  );
}

export default Component05;
