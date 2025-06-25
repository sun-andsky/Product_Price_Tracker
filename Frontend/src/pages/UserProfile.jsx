// src/pages/UserProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UseProfile.css';
import profileImage from '../assets/profile.jpg'; // adjust path if needed



<img src={profileImage} alt="Profile" />

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:8000/api/users/profile/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        const joinedDate = new Date(data.date_joined).toLocaleDateString();
        setUser({ ...data, date_joined: joinedDate });
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    await fetch("http://localhost:8000/api/users/logout/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmDelete) return;

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch("http://localhost:8000/api/users/delete/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Account deleted successfully.");
        localStorage.removeItem("authToken");
        navigate("/signup");
      } else {
        alert("Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred.");
    }
  };

  if (!user) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-left">
          <img 
          className='profile-img'a
          src={profileImage} alt="Profile" />
        </div>
        <div className="profile-right">
          <p className='username'>Hello, {user.username} 👋</p>
          <div className="profile-info">
            <div className='data'>
              <p >Email </p>
              <p >Date Joined </p>
              <p >Account Type</p>
            </div>
            
            <div className='data'>
            <p>: {user.email}</p>
            <p>: {user.date_joined}</p>
            <p>: Regular User</p>
            </div>
            
          </div>
          <div className="profile-actions">
            <p className="logout-btn" onClick={handleLogout}><i class="bi bi-box-arrow-right"></i>Logout</p>
            <p className="delete-btn" onClick={handleDelete}><i class="bi bi-trash" id='trash'></i>Delete Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
