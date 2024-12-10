import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MyNavbar from "./navbar";
import Footer from "./footer";
import axios from "axios";
import { useData } from "./CartContext";
import CryptoJS from "crypto-js";
import { useGoogleLogin } from "@react-oauth/google";
import Scrolltotopbtn from "./Scrolltotopbutton";
import Notification from "./Notification";
import googleicon from "../images/googleicon.png";

const Login = () => {
  const { setUserData, guest_product, addToCart } = useData();
  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [user, setUser] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in and redirect accordingly
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      // If the user is already logged in, redirect to the target page or home
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        navigate(redirectPath); // Redirect to the page they were trying to visit
        sessionStorage.removeItem("redirectAfterLogin");
      } else {
        navigate("/"); // Default to home
      }
    }
  }, [navigate]);

  const signin = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
      // Google login logic
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          const profile = res.data;
          axios
            .post(
              `${process.env.REACT_APP_HOST}${process.env.REACT_APP_PORT}/googleLogin`,
              { username: profile.email }
            )
            .then((res) => {
              if (res.data !== "Error") {
                const data = res.data[0];
                setUserData(data);
                var token = data.user_id;
                sessionStorage.setItem("token", "user");
                if (!token) {
                  setNotification({
                    message: "Unable to login. Please try after some time.",
                    type: "error",
                  });
                  setTimeout(() => setNotification(null), 3000);
                  return;
                }
                sessionStorage.removeItem("user-token");
                sessionStorage.setItem("user-token", token);

                // Handle redirect after login
                const redirectPath = sessionStorage.getItem("redirectAfterLogin");
                if (redirectPath) {
                
                 
                  navigate(redirectPath); // Redirect to the saved page
                  sessionStorage.removeItem("redirectAfterLogin");
                } else {
                  navigate("/"); // Default to home
                }
              } else {
                setNotification({
                  message: "Invalid Username or Password",
                  type: "error",
                });
                setTimeout(() => setNotification(null), 3000);
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    }
  }, [user, setUserData, navigate]);

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    // Only encrypt the password just before sending it to the backend
    const encryptedPassword = CryptoJS.MD5(values.password).toString();
  
    let url = values.username === "admin@admin" ? "admin" : "user";
    
    // Prepare the data to be sent to the backend
    const dataToSend = {
      ...values, // Keep the other fields intact
      password: encryptedPassword, // Use the encrypted password
    };
  
    // Make the POST request with the encrypted password
    axios
      .post(
        `${process.env.REACT_APP_HOST}${process.env.REACT_APP_PORT}/${url}`,
        dataToSend
      )
      .then((res) => {
        if (res.data !== "Fail" && res.data !== "Error") {
          sessionStorage.setItem("accessToken", res.data.accessToken);
          const data = res.data.data[0];
          setUserData(data);
          let token;
          if (url === "user") {
            token = data.user_id;
            sessionStorage.setItem("token", "user");
          } else {
            token = data.admin_id;
            sessionStorage.setItem("token", "admin");
          }
  
          if (!token) {
            setNotification({
              message: "Unable to login. Please try after some time.",
              type: "error",
            });
            setTimeout(() => setNotification(null), 3000);
            return;
          }
          sessionStorage.removeItem("user-token");
          sessionStorage.setItem("user-token", token);
  
          // Redirect logic after successful login
          const redirectPath = sessionStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            navigate(redirectPath); // Redirect to the page they were trying to visit
            sessionStorage.removeItem("redirectAfterLogin");
          } else {
            navigate("/"); // Default to home
          }
  
          guest_product.forEach((item) => {
            item.userid = token;
            addToCart(item, "main", item.quantity);
          });
          sessionStorage.removeItem("guest_products");
        } else {
          setNotification({
            message: "Invalid Username or Password",
            type: "error",
          });
          setTimeout(() => setNotification(null), 3000);
        }
      })
      .catch((err) => console.log(err));
  };
  
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fullscreen">
      <MyNavbar />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <main className="bbb">
        <div className="mmm d-md-flex gap-1">
          <div className="left-side"></div>
          <div className="right-side">
            <form action="" method="post" onSubmit={handleSubmit}>
              <h6 className="text-end">
                Not a member?{" "}
                <Link className="text-decoration-none" to="/register">
                  Register now
                </Link>
              </h6>
              <h3 className="text-center mb-4 mt-4">Log In</h3>
              <div className="input-field">
                <label htmlFor="email" className="fixed-label fw-bold">
                  Email *
                </label>
                <input
                  type="email"
                  id="username"
                  name="username"
                  value={values.username}
                  onChange={handleInput}
                  required
                />
              </div>
              <div className="input-field passwordgroup">
                <label htmlFor="password" className="fixed-label fw-bold">
                  Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={handleInput}
                  required
                />
                <button
                  type="button"
                  id="btnToggle"
                  className="toggle12"
                  onClick={handleTogglePassword}
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
              <div className="text-end p-1">
                <Link to="/forgotpassword">Forgot Password</Link>
              </div>
              <div>
                <button
                  type="submit"
                  name="btn-login"
                  className="btn btn-primary w-100 mt-3"
                >
                  Log In
                </button>
              </div>
            </form>
            <div className="d-flex justify-content-around p-2 mt-3">
              <div style={{ borderBottom: "1px solid gray", width: "45%" }}></div>
              <p className="text-center" style={{ marginBottom: "-10px" }}>
                or
              </p>
              <div style={{ borderBottom: "1px solid gray", width: "45%" }}></div>
            </div>
            <div className="mt-3 mb-5 p-2">
              <button onClick={signin} className="btn shadow w-100 p-2">
                <img src={googleicon} alt="Google icon" width="30" />
                &nbsp;&nbsp;&nbsp;Continue With Google
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Scrolltotopbtn />
    </div>
  );
};

export default Login;

