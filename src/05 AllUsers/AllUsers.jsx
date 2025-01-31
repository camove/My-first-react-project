import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { AuthContext } from "../Context/AuthContext";
import styles from "./AllUsers.module.css";
import { NavLink } from "react-router";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    ageRange: "",
    flatsCounterRange: "",
    isAdmin: "",
  });
  const [sortCriteria, setSortCriteria] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const { userId: loggedInUserId } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // aducem din baza de date utilizatorii si apartamentele
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const flatsCollection = collection(db, "flats");
      const usersSnapshot = await getDocs(usersCollection);
      const flatsSnapshot = await getDocs(flatsCollection);
      //aflam anul curent pentru a putea calcula varsta utilizatorului
      const currentYear = new Date().getFullYear();
      //calculam numarul de apartamente postate de fiecare utilizator
      const flatsData = flatsSnapshot.docs.reduce((acc, doc) => {
        const flat = doc.data();
        acc[flat.userId] = (acc[flat.userId] || 0) + 1;
        return acc;
      }, {});
      //aflam varsta fiecarui utilizator
      const usersData = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        const birthDate = userData.birthDate
          ? new Date(userData.birthDate)
          : null;
        const age = birthDate ? currentYear - birthDate.getFullYear() : "";
        //actualizam userData cu noile informatii: varsta, numarul apartamentelor si daca este admin sau nu
        return {
          id: doc.id,
          ...userData,
          age,
          flatsCounter: flatsData[doc.id] || 0,
          type: doc.data().isAdmin ? "Admin" : "Regular",
        };
      });
      //actualizam starea userData
      setUsers(usersData);
      //actualizam loading => datele s-au terminat de incarcat, se afiseaza componenta
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // gestionare valori pentru filtrare
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };
  // resetare valori de filtrare
  const resetFiltersAndSort = () => {
    setFilters({ ageRange: "", flatsCounterRange: "", isAdmin: "" });
    setSortCriteria("");
    setSortOrder("asc");
  };
  // modificarea tipului de utilizator din regular in admin si invers
  const toggleAdminPermissions = async (id, isAdmin) => {
    try {
      //aducem din baza de date userul si daca este regular facem update in admin si invers
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { isAdmin: !isAdmin });
      setUsers(
        users.map((user) =>
          user.id === id
            ? {
                ...user,
                isAdmin: !isAdmin,
                type: !isAdmin ? "Admin" : "Regular",
              }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to toggle admin permissions:", error);
    }
  };
  //functie pentru stergerea unui utilizator si a tuturor datelor acestuia
  const removeUser = async (id) => {
    try {
      const userDocRef = doc(db, "users", id); //cream pe baza id-ului referinta catre documentul cu userul care ne intereseaza
      const flatsCollection = collection(db, "flats"); //cream referinta catre flats
      const messagesCollection = collection(db, "messages"); //cream referinta catre mesaje
      const favoritesCollection = collection(db, "userFavorites"); //cream referinta catre favorite

      const userFlatsQuery = query(flatsCollection, where("userId", "==", id)); //aducem apartamentele corespunzatoare user-ului logat pe baza id-ului
      const userMessagesQuery = query(
        messagesCollection,
        where("userId", "==", id)
      ); //la fel pentru mesaje
      const userFavoritesByUserQuery = query(
        favoritesCollection,
        where("userId", "==", id)
      ); //la fel pentru elementele din favorite
      const flatsSnapshot = await getDocs(userFlatsQuery); //se asteapta finalizarea interogarii
      const messagesSnapshot = await getDocs(userMessagesQuery);
      const favoritesByUserSnapshot = await getDocs(userFavoritesByUserQuery);

      const batch = writeBatch(db);

      // stergem apartamentele și salvăm flatId-urile pentru a le folosi în ștergerea din userFavorites
      const flatIds = flatsSnapshot.docs.map((flatDoc) => {
        batch.delete(flatDoc.ref);
        return flatDoc.id;
      });

      // stergem mesajele utilizatorului
      messagesSnapshot.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });

      // stergem documentele din userFavorites adaugate de utilizator
      favoritesByUserSnapshot.forEach((favoriteDoc) => {
        batch.delete(favoriteDoc.ref);
      });

      // stergem documentele din userFavorites asociate flatId-urilor
      for (const flatId of flatIds) {
        const userFavoritesQuery = query(
          favoritesCollection,
          where("flatId", "==", flatId)
        );
        const favoritesSnapshot = await getDocs(userFavoritesQuery);
        favoritesSnapshot.forEach((favoriteDoc) => {
          batch.delete(favoriteDoc.ref);
        });
      }

      // stergem documentul utilizatorului
      batch.delete(userDocRef);

      await batch.commit(); //aplica toate operatiunile de scriere adaugate in batch; daca una dintre operatiuni esueaza, toate vor fi anulate

      setUsers(users.filter((user) => user.id !== id)); //se actualizeaza starea users pentru a elimina utilizatorul sters
    } catch (error) {
      console.error("Failed to remove user and associated data:", error);
    }
  };
  // optiuni de filtrare
  const filteredUsers = users.filter((user) => {
    return (
      //filtrare dupa age range
      (filters.ageRange === "" ||
        (user.age >= parseInt(filters.ageRange.split("-")[0]) &&
          user.age <= parseInt(filters.ageRange.split("-")[1]))) &&
      // filtrare dupa flat counter range
      (filters.flatsCounterRange === "" ||
        (user.flatsCounter >=
          parseInt(filters.flatsCounterRange.split("-")[0]) &&
          user.flatsCounter <=
            parseInt(filters.flatsCounterRange.split("-")[1]))) &&
      //filtrare dupa tipul de utilizator
      (filters.isAdmin === "" || user.isAdmin === (filters.isAdmin === "true"))
    );
  });
  //optiuni de sortare
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compare = 0;
    switch (sortCriteria) {
      case "firstName":
        compare = a.firstName.localeCompare(b.firstName);
        break;
      case "lastName":
        compare = a.lastName.localeCompare(b.lastName);
        break;
      case "flatsCounter":
        compare = a.flatsCounter - b.flatsCounter;
        break;
      default:
        break;
    }
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Users</h1>
      {/* in functie de valoarea isLoading se afiseaza sau nu loaderul astfel incat pana se incarca datele utilizatorul sa stie ca aplicatia lucreaza */}
      {loading ? (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <div className={styles.loadingText}>
            Hold tight... REACT magic in progress ⚛️
          </div>
        </div>
      ) : (
        <>
          {/* afisare optiuni de filtrare */}
          <div className={styles.filterContainer}>
            <h2>Filter Options</h2>
            <div className={styles.inputFilterFieldsContainer}>
              <input
                type="text"
                name="ageRange"
                placeholder="Age Range (e.g., 20-30)"
                value={filters.ageRange}
                onChange={handleFilterChange}
              />
              <input
                type="text"
                name="flatsCounterRange"
                placeholder="Flats Counter Range (e.g., 0-5)"
                value={filters.flatsCounterRange}
                onChange={handleFilterChange}
              />

              <select
                className={styles.selectOptionButton}
                name="isAdmin"
                onChange={handleFilterChange}
                value={filters.isAdmin}
              >
                <option value="">All</option>
                <option value="true">Admin</option>
                <option value="false">Regular</option>
              </select>
            </div>
          </div>
          {/* afisare optiuni de sortare */}
          <div className={styles.sortContainer}>
            <h2>Sort Options</h2>
            <div className={styles.inputFilterFieldsContainer}>
              <select
                className={styles.selectOptionButton}
                onChange={handleSortChange}
                value={sortCriteria}
              >
                <option value="">Select</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="flatsCounter">Flats Counter</option>
              </select>
              <button
                className={styles.ascDescButton}
                onClick={handleSortOrderChange}
              >
                {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
              </button>
            </div>
          </div>
          {/* buton de resetare filtre */}
          <button
            className={styles.resetFiltersButton}
            onClick={resetFiltersAndSort}
          >
            Reset Filters and Sort
          </button>

          {/* afisare informatii intr-un tabel construit cu div-uri si display grid in css */}
          <div className={styles.gridContainer}>
            <div className={styles.gridHeader}>First Name</div>
            <div className={styles.gridHeader}>Last Name</div>
            <div className={styles.gridHeader}>Age</div>
            <div className={styles.gridHeader}>Email</div>
            <div className={styles.gridHeader}>Type</div>
            <div className={styles.gridHeader}>Flats Counter</div>
            <div className={styles.gridHeader}>Is Admin</div>
            <div className={styles.gridHeader}>Actions</div>
            {/* se itereaza prin array si se afiseaza informatiile in functie de filtrele activate */}
            {sortedUsers.map((user) => (
              <React.Fragment key={user.id}>
                <div className={styles.gridItem}>{user.firstName}</div>
                <div className={styles.gridItem}>{user.lastName}</div>
                <div className={styles.gridItem}>{user.age}</div>
                <div className={styles.gridItem}>{user.email}</div>
                <div className={styles.gridItem}>{user.type}</div>
                <div className={styles.gridItem}>{user.flatsCounter}</div>
                <div className={styles.gridItem}>
                  {user.isAdmin ? "Yes" : "No"}
                </div>
                <div className={styles.gridItem}>
                  <div className={styles.actionContainer}>
                    {user.id !== loggedInUserId ? (
                      <>
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            toggleAdminPermissions(user.id, user.isAdmin)
                          }
                        >
                          {user.isAdmin ? "Switch to Regular" : "Grant Admin"}
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => removeUser(user.id)}
                        >
                          Remove User
                        </button>
                      </>
                    ) : (
                      <>
                        <div className={styles.emptyCell}></div>
                        <div className={styles.emptyCell}></div>
                      </>
                    )}
                    <div>
                      <NavLink
                        className={styles.linkViewDetails}
                        to={`/edit-profile/${user.id}`}
                      >
                        View Details
                      </NavLink>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* creare tabel cu cap de tabel vertical pentru gestionare design la rezoluții mici */}
          <div className={styles.verticalTable}>
            {sortedUsers.map((user) => (
              <React.Fragment key={user.id}>
                <div className={styles.verticalHeader}>User Detail</div>
                <div className={styles.verticalItem}>
                  {user.firstName} {user.lastName}
                  <br />
                  {user.email}
                </div>
                <div className={styles.verticalHeader}>Age</div>
                <div className={styles.verticalItem}>{user.age}</div>
                <div className={styles.verticalHeader}>User Data</div>
                <div className={styles.verticalItem}>
                  {user.type}
                  <br />
                  Flats: {user.flatsCounter}
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
                    {user.id !== loggedInUserId ? (
                      <>
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            toggleAdminPermissions(user.id, user.isAdmin)
                          }
                        >
                          {user.isAdmin ? "Switch to Regular" : "Grant Admin"}
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => removeUser(user.id)}
                        >
                          Remove User
                        </button>
                      </>
                    ) : (
                      <>
                        <div className={styles.emptyCell}></div>
                        <div className={styles.emptyCell}></div>
                      </>
                    )}
                    <div>
                      <NavLink
                        className={styles.linkViewDetails}
                        to={`/edit-profile/${user.id}`}
                      >
                        View Details
                      </NavLink>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllUsers;
