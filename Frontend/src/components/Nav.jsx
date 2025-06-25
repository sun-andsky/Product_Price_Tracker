import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Nav.css";

const Nav = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    fetchUser(); // Re-fetch user on route change
  }, [location]);

  return (
    <nav className="nav">
      <Link to="/" className="nav-link">
        <div className="nav-logo">
         <i class="bi bi-box-seam-fill"></i>Price Tracker
        </div>
      </Link>
      

      <ul className="nav-links">
        <li className="btn-bm">
          <i class="bi bi-bookmark-fill"></i>
          <Link to="/wishlist" className="nav-link">
            Bookmarks
          </Link>
        </li>

        {!user ? (
          <>
            <li className="btn">
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
            <li className="btn">
              <Link to="/login" className="nav-link">
                
                Signup
              </Link>
            </li>
            
          </>
        ) : (
          <li className="btn">
            <Link to="/profile" className="nav-link">
              <i className="bi bi-person-circle"></i> {user.username}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
