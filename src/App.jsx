import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
      </Routes>
    </Router>
  );
}

export default App
