import React, { useContext, useEffect, useState } from "react";
import styles from "./Favourites.module.css";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { AuthContext } from "../Context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { NavLink } from "react-router-dom";

const Favourites = () => {
  const { userId } = useContext(AuthContext);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavourites = async () => {
      const favouritesCollection = collection(db, "userFavorites");
      const q = query(favouritesCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const favouriteFlats = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const favouriteData = docSnapshot.data();
          const flatDoc = await getDoc(doc(db, "flats", favouriteData.flatId));
          if (flatDoc.exists()) {
            return { id: flatDoc.id, ...flatDoc.data() };
          }
          return null;
        })
      );
      setFavourites(favouriteFlats.filter((flat) => flat !== null));
      setLoading(false); // oprirea loader-ului dupa incarcare
    };
    if (userId) {
      fetchFavourites();
    }
  }, [userId]);

  const handleRemoveFavourite = async (flatId) => {
    try {
      const favouriteDocQuery = query(
        collection(db, "userFavorites"),
        where("userId", "==", userId),
        where("flatId", "==", flatId)
      );
      const querySnapshot = await getDocs(favouriteDocQuery);
      if (!querySnapshot.empty) {
        await deleteDoc(querySnapshot.docs[0].ref);
      }
      setFavourites(favourites.filter((flat) => flat.id !== flatId));
      toast.success("Removed from favourites");
    } catch (error) {
      toast.error("Failed to remove from favourites");
      console.error("Failed to remove from favourites:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <Toaster />
      </div>
      <h1 className={styles.title}>Favourite Flats</h1>
      {loading ? (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <div className={styles.loadingText}>
            Bear with us... just fixing a div! 🐻
          </div>
        </div>
      ) : favourites.length > 0 ? (
        <>
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

            {favourites.map((flat) => (
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
                <div className={styles.gridItem}>
                  <div className={styles.actionContainer}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleRemoveFavourite(flat.id)}
                    >
                      Remove
                    </button>
                    <NavLink
                      className={styles.linkViewDetails}
                      to={`/flat/${flat.id}`}
                    >
                      View Details
                    </NavLink>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className={styles.verticalTable}>
            {favourites.map((flat) => (
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
                      onClick={() => handleRemoveFavourite(flat.id)}
                    >
                      Remove
                    </button>
                    <NavLink
                      className={styles.linkViewDetails}
                      to={`/flat/${flat.id}`}
                    >
                      View Details
                    </NavLink>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noFavourites}>You have no favourite flats.</div>
      )}
    </div>
  );
};

export default Favourites;
