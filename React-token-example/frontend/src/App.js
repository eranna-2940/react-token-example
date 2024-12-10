import React from 'react';
// import axios from 'axios';
import Login from './login';
import Changepassword from './changepassword';

function App() {

  

  return (
    <div className="App">
      <h1>JWT Authentication</h1>
        <Login/>
        <Changepassword/>
    </div>
  );
}

export default App;
