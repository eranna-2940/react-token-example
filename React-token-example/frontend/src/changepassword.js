import React, { useEffect, useState } from "react";
import MyNavbar from "../navbar";
import Customermenu from "./Customermenu";
import Footer from "../footer";
import Customerbanner from "./Customerbanner";
import axios from "axios";
import Scrolltotopbtn from "../Scrolltotopbutton";
import Notification from "../Notification";
import CryptoJS from "crypto-js";

export default function Changepassword() {

  const [userdetails,setUserDetails]= useState([])
  const [admindetails,setAdminDetails]=useState([])
  const [notification, setNotification] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewCnfmPassword, setShowNewCnfmPassword] = useState(false);


  const [values,setValues]= useState({
     oldpassword:'',
     newpassword:'',
     confirmpassword:''
  })


  
  const handlechange = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }
    
  useEffect(() => {
    // Fetch all products
    axios.get(`${process.env.REACT_APP_HOST}${process.env.REACT_APP_PORT}/user`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          Accept: "application/json",
        },
      }
    )
      .then((res) => {
        if (res.data !== "Fail" && res.data !== "Error") {
          const userid = sessionStorage.getItem("user-token");
          setUserDetails(res.data.filter((item)=>item.user_id.toString() === userid))
        }
      })
      .catch((error) => {
        console.log("Error fetching all products:", error);
      });
    },[])

    useEffect(() => {
      // Fetch all products
      axios.get(`${process.env.REACT_APP_HOST}${process.env.REACT_APP_PORT}/admin`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            Accept: "application/json",
          },
        }
      )
        .then((res) => {
          if (res.data !== "Fail" && res.data !== "Error") {
            console.log(res.data)
            setAdminDetails(res.data)
          }
        })
        .catch((error) => {
          console.log("Error fetching all products:", error);
        });
      },[])
  
      const handleChangePassword = (e) => {
        e.preventDefault();
        const user = sessionStorage.getItem("token");
        let url = "";
        let updatedUser = null;
        let updatedAdmin = null;
      
        // Hash the old password entered by the user using MD5
        const hashedOldPassword = CryptoJS.MD5(values.oldpassword).toString();
        const hashedNewPassword = CryptoJS.MD5(values.newpassword).toString();
      
        if (user === "user") {
          url = "updateuser";
          updatedUser = {
            email: userdetails[0].email,
            password: hashedNewPassword,  // Send the hashed new password
          };
        } else if (user === "admin") {
          url = "updateadmin";
          updatedAdmin = {
            email: admindetails[0].email,
            password: hashedNewPassword,  // Send the hashed new password
          };
        }
      
        if (!updatedUser && !updatedAdmin) {
          console.log("Invalid user type.");
          return;
        }
      
        // Compare hashed old password (do this on the server, not client side)
        if (user === "user" && hashedOldPassword !== userdetails[0].password) {
          setNotification({ message: "Old password is incorrect.", type: 'error' });
          setTimeout(() => setNotification(null), 3000);
          return;
        }
      
        if (user === "admin" && hashedOldPassword !== admindetails[0].password) {
          setNotification({ message: "Old password is incorrect.", type: 'error' });
          setTimeout(() => setNotification(null), 3000);
          return;
        }
      
        if (values.newpassword !== values.confirmpassword) {
          setNotification({ message: "Password and Confirm Passwords do not match.", type: 'error' });
          setTimeout(() => setNotification(null), 3000);
          return;
        }
      
        const updatedData = updatedUser ? updatedUser : updatedAdmin;
      
        axios
          .post(`${process.env.REACT_APP_HOST}${process.env.REACT_APP_PORT}/${url}/`, updatedData)
          .then((res) => {
            setNotification({ message: "Password updated successfully", type: 'success' });
            setTimeout(() => {
              setNotification(null);
              window.location.reload(false);
            },2000);
           
          })
          .catch((error) => {
            console.log("Error updating password:", error);
          });
      };
      
      
      const handleToggleOldPassword = () => {
        setShowOldPassword(!showOldPassword);
      };
      const handleToggleNewPassword = () => {
        setShowNewPassword(!showNewPassword);
      };
      const handleToggleNewCnfmPassword = () => {
        setShowNewCnfmPassword(!showNewCnfmPassword);
      };


  return (
    <div className="fullscreen">
      <MyNavbar />
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      <main>
      <Customerbanner />
      <div className="d-lg-flex justify-content-around p-2 ps-lg-5 pe-lg-5">
        <div className="col-lg-3 col-xs-12 col-md-12 p-lg-4 p-2">
          <Customermenu />
        </div>
        <div className="col-xs-12 col-md-12 col-lg-9 p-lg-4 p-2">
          <form onSubmit={handleChangePassword}>
            <div>
              <div className="d-md-flex col-md-8 col-xs-12 mt-3 mb-3">
                <label htmlFor="oldpassword" className="col-md-4 col-xs-12">
                  Old Password
                </label>
                <div className="d-flex col-md-8  passwordgroup">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldpassword"
                    id="oldpassword"
                    placeholder="Old Password"
                    value={values.oldpassword}
                    className="form-control"
                    onChange={handlechange}
                    required
                  />
                  <button
                  type="button"
                  id="btnToggle"
                  className="toggle12 pe-3"
                  onClick={handleToggleOldPassword}
                >
                  <i
                    className={`bi ${
                      showOldPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
                  &nbsp;<span className="text-danger fs-4">*</span>
                </div>
              </div>

              <div className="d-md-flex col-md-8 col-xs-12 mt-3 mb-3">
                <label htmlFor="newpassword" className="col-md-4 col-xs-12">
                  New Password
                </label>
                <div className="d-flex col-md-8 passwordgroup">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newpassword"
                    id="newpassword"
                    placeholder="New Password"
                    value={values.newpassword}
                    className="form-control"
                    onChange={handlechange}
                    required
                  />
                  <button
                  type="button"
                  id="btnToggle"
                  className="toggle12 pe-3"
                  onClick={handleToggleNewPassword}
                >
                  <i
                    className={`bi ${
                      showNewPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
                  &nbsp;<span className="text-danger fs-4">*</span>
                </div>
              </div>
              <div className="d-md-flex col-md-8 col-xs-12 mt-3 mb-3">
                <label htmlFor="confirmpassword" className="col-md-4 col-xs-12">
                  Confirm Password
                </label>
                <div className="d-flex col-md-8 passwordgroup">
                  <input
                    type={showNewCnfmPassword ? "text" : "password"}
                    name="confirmpassword"
                    id="confirmpassword"
                    placeholder="Confirm Password"
                    value={values.confirmpassword}
                    className="form-control"
                    onChange={handlechange}
                    required
                  />
                  <button
                  type="button"
                  id="btnToggle"
                  className="toggle12 pe-3"
                  onClick={handleToggleNewCnfmPassword}
                >
                  <i
                    className={`bi ${
                      showNewCnfmPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
                  &nbsp;<span className="text-danger fs-4">*</span>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-success mt-3 mb-5" >
              Change Password
            </button>
          </form>
        </div>
      </div>
      </main>
      <Footer />
      <Scrolltotopbtn/>
    </div>
  );
}
