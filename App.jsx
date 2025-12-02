import React from "react";
import {BrowserRouter as Router,Routes, Route } from "react-router-dom";
import MainPage from './components/MainPage';
import LostPage from './components/LostPage';
import FoundPage from './components/FoundPage';
import SignUp from './components/SignUp';
import LoginPage from './components/LoginPage';
import ItemsPage from './components/ItemsPage'; 
import ClaimTest from './components/ClaimTest';
import ClaimDemo from './components/Claim/ClaimDemo';
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path = "/" element = {<MainPage/>}/>
          <Route path = "/lost" element = {<LostPage/>} />
          <Route path = "/found" element = {<FoundPage/>}/>
          <Route path = "/signup" element = {<SignUp/>}/>
          <Route path = "/login" element = {<LoginPage/>}/>
          <Route path = "/items" element = {<ItemsPage/>}/>
          <Route path = "/test-claim" element = {<ClaimTest/>}/>
          <Route path = "/claim-demo" element = {<ClaimDemo/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App

