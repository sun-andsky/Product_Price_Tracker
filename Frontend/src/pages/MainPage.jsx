import { useState, useEffect } from "react";
import { fetchProducts } from "../api/api";
import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import './MainPage.css';

function MainPage() {
  return (
    <div className="main-page">
      <p  className="heading"><span className="t">TRACK. </span> 
      <span className="sh"> SHOP. </span><span className="sa">SAVE. </span></p>
      <SearchBar />
    </div>
  );
}

export default MainPage;
