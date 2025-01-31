import React from "react";
import styles from "./Logout.module.css";
import Modal from "react-modal";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

const Logout = ({ isOpen, onClose }) => {
  const { setLoggedIn } = useContext(AuthContext); //se acceseaza setLoggedIn din AuthContext
  const navigate = useNavigate();
  //functie pentru resetare stare de logare, inchide modalul si elimina datele utilizatorului din local storage; redirectionare catre login
  const handleLogout = () => {
    setLoggedIn(null);
    onClose();
    localStorage.removeItem("userId");
    localStorage.removeItem("loginTime");
    navigate("/login");
  };

  return (
    <div>
      <Modal
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Logout"
      >
        <h1>Logout</h1>
        <p>Are you sure you want to logout?</p>

        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleLogout}>
            Yes
          </button>
          <button className={styles.button} type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Logout;
