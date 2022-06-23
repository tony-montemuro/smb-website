import React from "react";
import './navbar.css';
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="site-title">Home</Link>
      <ul>
        <li>
          <Link to="/games">Games</Link>
        </li>
        <li>
          <Link to="/resources">Resources</Link>
        </li>
        <li>
          <Link to="/support">Support</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/profile">Edit Profile</Link>
        </li>
      </ul>
    </nav>
  );
};
