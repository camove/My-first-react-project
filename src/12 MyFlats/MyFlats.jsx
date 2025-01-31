import React, { useState, useEffect, useContext } from "react";
import styles from "./MyFlats.module.css";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

const MyFlats = () => {
  const { userId } = useContext(AuthContext);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //incarcare date aferente apartamentelor postate de utilizatorul logat
  useEffect(() => {
    const fetchFlats = async () => {
      setLoading(true);
      setError(null);

      try {
        const flatsCollection = collection(db, "flats");
        const q = query(flatsCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const flatsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlats(flatsData);
      } catch (err) {
        setError("Failed to fetch flats");
        console.error("Failed to fetch flats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlats();
  }, [userId]);
  //gestionare stergere apartament
  const handleDelete = async (flatId) => {
    try {
      // stergem mesajele asociate apartamentului
      const messagesCollectionRef = collection(db, "messages");
      const messagesQuery = query(
        messagesCollectionRef,
        where("flatId", "==", flatId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesBatch = writeBatch(db);
      messagesSnapshot.forEach((doc) => {
        messagesBatch.delete(doc.ref);
      });
      await messagesBatch.commit();

      // stergem favoritele asociate apartamentului
      const favoritesCollectionRef = collection(db, "userFavorites");
      const favoritesQuery = query(
        favoritesCollectionRef,
        where("flatId", "==", flatId)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesBatch = writeBatch(db);
      favoritesSnapshot.forEach((doc) => {
        favoritesBatch.delete(doc.ref);
      });
      await favoritesBatch.commit();

      // stergem apartamentul
      await deleteDoc(doc(db, "flats", flatId));
      setFlats(flats.filter((flat) => flat.id !== flatId));
      toast.success("Flat deleted successfully");
    } catch (error) {
      toast.error("Failed to delete flat");
      console.error("Failed to delete flat:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Flats</h1>
      {/* in functie de valoarea isLoading se afiseaza sau nu loaderul astfel incat pana se incarca datele utilizatorul sa stie ca aplicatia lucreaza */}
      {loading ? (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <div className={styles.loadingText}>
            Patience, my dear Watson... state is updating 🕵️
          </div>
        </div>
      ) : (
        <>
          {/* afisare informatii intr-un tabel construit cu div-uri si display grid in css */}
          <div className={styles.gridContainer}>
            <div className={styles.gridHeader}>City</div>
            <div className={styles.gridHeader}>Street Name</div>
            <div className={styles.gridHeader}>Street Number</div>
            <div className={styles.gridHeader}>Size</div>
            <div className={styles.gridHeader}>Has AC</div>
            <div className={styles.gridHeader}>Year Built</div>
            <div className={styles.gridHeader}>Price</div>
            <div className={styles.gridHeader}>Date Available</div>
            <div className={styles.gridHeader}>Actions</div>
            {/* se itereaza prin array si se afiseaza informatiile */}
            {flats.map((flat) => (
              <React.Fragment key={flat.id}>
                <div className={styles.gridItem}>{flat.city}</div>
                <div className={styles.gridItem}>{flat.streetName}</div>
                <div className={styles.gridItem}>{flat.streetNumber}</div>
                <div className={styles.gridItem}>{flat.size} m²</div>
                <div className={styles.gridItem}>
                  {flat.hasAc ? "Yes" : "No"}
                </div>
                <div className={styles.gridItem}>{flat.yearBuild}</div>
                <div className={styles.gridItem}>{flat.price} €</div>
                <div className={styles.gridItem}>{flat.availableDate}</div>
                <div className={`${styles.gridItem} ${styles.actionContainer}`}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDelete(flat.id)}
                  >
                    Delete
                  </button>
                  <NavLink
                    className={styles.linkViewDetails}
                    to={`/flat/${flat.id}`}
                  >
                    View
                  </NavLink>
                  <NavLink
                    className={styles.linkViewDetails}
                    to={`/edit-flat/${flat.id}`}
                  >
                    Edit
                  </NavLink>
                </div>
              </React.Fragment>
            ))}
          </div>
          {/* creare tabel cu cap de tabel vertical pentru gestionare design la rezoluții mici */}
          <div className={styles.verticalTable}>
            {flats.map((flat) => (
              <React.Fragment key={flat.id}>
                <div className={styles.verticalHeader}>Flat Detail</div>
                <div className={styles.verticalItem}>
                  Oras: {flat.city}, strada {flat.streetName}{" "}
                  {flat.streetNumber}
                </div>
                <div className={styles.verticalHeader}>Additional Info</div>
                <div className={styles.verticalItem}>
                  Bulid in {flat.yearBuild}; has: {flat.size} m²{" "}
                  {flat.hasAc ? "with AC" : "without AC"}
                  <br />
                  Price: {flat.price}
                  <br />
                  Available from: {flat.availableDate}
                </div>
                <div
                  className={`${styles.verticalHeader} ${styles.borderSeparator}`}
                >
                  Actions
                </div>
                <div
                  className={`${styles.verticalItem} ${styles.borderSeparator}`}
                >
                  <div className={styles.actionContainer}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleDelete(flat.id)}
                    >
                      Delete
                    </button>
                    <NavLink
                      className={styles.linkViewDetails}
                      to={`/flat/${flat.id}`}
                    >
                      View
                    </NavLink>
                    <NavLink
                      className={styles.linkViewDetails}
                      to={`/edit-flat/${flat.id}`}
                    >
                      Edit
                    </NavLink>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
      <div className={styles.addButtonContainer}>
        <NavLink className={styles.addButton} to="/add-flat">
          Insert New Flat
        </NavLink>
      </div>
    </div>
  );
};

export default MyFlats;
