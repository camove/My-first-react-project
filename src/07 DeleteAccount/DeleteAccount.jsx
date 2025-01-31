import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import Modal from "react-modal";
import styles from "./DeleteAccount.module.css";

const deleteUserData = async (userId) => {
  const flatsCollectionRef = collection(db, "flats");
  const messagesCollectionRef = collection(db, "messages");
  const favoritesCollectionRef = collection(db, "userFavorites");

  const userFlatsQuery = query(flatsCollectionRef, where("userId", "==", userId));
  const userMessagesQuery = query(messagesCollectionRef, where("userId", "==", userId));
  const userFavoritesByUserQuery = query(favoritesCollectionRef, where("userId", "==", userId));

  const batch = writeBatch(db);

  try {
    // gaseste si sterge apartamentele utilizatorului
    const flatsSnapshot = await getDocs(userFlatsQuery);
    const flatIds = flatsSnapshot.docs.map((flatDoc) => {
      batch.delete(flatDoc.ref);
      return flatDoc.id;
    });

    // gaseste si sterge mesajele utilizatorului
    const messagesSnapshot = await getDocs(userMessagesQuery);
    messagesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // gaseste si sterge favoritele adaugate de utilizator
    const favoritesByUserSnapshot = await getDocs(userFavoritesByUserQuery);
    favoritesByUserSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // gaseste si sterge documentele din userFavorites asociate flatId-urilor
    for (const flatId of flatIds) {
      const userFavoritesQuery = query(favoritesCollectionRef, where("flatId", "==", flatId));
      const favoritesSnapshot = await getDocs(userFavoritesQuery);
      favoritesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    // se executa batch-ul pentru a șterge toate documentele
    await batch.commit();
    // console.log("User data deleted successfully");
  } catch (error) {
    console.error("Error deleting user data:", error);
  }
};

const DeleteAccount = ({ isOpen, onClose }) => {
  const { setLoggedIn, userId } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      await deleteUserData(userId);
      await deleteDoc(userDocRef);
      setLoggedIn(null);
      onClose(); // Închide modalul
      localStorage.removeItem("userId");
      localStorage.removeItem("loginTime");
      navigate("/register"); // redirectioneaza catre pagina de register
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <Modal
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Delete Account"
    >
      <h1>Delete Account</h1>
      <p>Are you sure you want to delete your account? This action can't be undone.</p>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleDeleteAccount}>
          Yes
        </button>
        <button className={styles.button} type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAccount;
