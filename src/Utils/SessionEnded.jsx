import React, { useContext } from "react";
import styles from "./SessionEnded.module.css";
import Modal from "react-modal";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const SessionEnded = ({ isOpen, onClose }) => {
  const { setLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggedIn(null);
    onClose();
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
        <h1>Session expired!</h1>
        <p>
          Your 60 minutes session has expired. Please login again for a new
          session.
        </p>

        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleLogout}>
            Ok
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionEnded;
