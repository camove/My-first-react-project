import React, { useEffect, useState, useContext } from "react";
import styles from "./HomePage.module.css";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const HomePage = () => {
  const [flats, setFlats] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    minSize: "",
    maxSize: "",
  });
  const [sortCriteria, setSortCriteria] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const { userId } = useContext(AuthContext);

  //rulam functia fetchFlats la initializarea componentei, o singura data, pentru aducerea detaliilor fiecarui apartament
  useEffect(() => {
    const fetchFlats = async () => {
      setLoading(true);
      const flatsCollection = collection(db, "flats"); //cream referinta catre toate documentele din colectia 'flats' din baza de date, db
      const querySnapshot = await getDocs(flatsCollection); //intrerupe executarea codului pana obtine toate documentele (docs) din colectia flats
      const flatsData = await Promise.all(
        //functie asincrona de obtinere a unui array care sa contina cate un obiect pentru fiecare apartament cu toate detaliile, inclusiv ownerul si emailul acestuia (Promise.all returneaza un array)
        querySnapshot.docs.map(async (docSnapshot) => {
          //itereaza prin fiecare apartament si executa o functie asincrona pentru fiecare apartament
          const flat = { id: docSnapshot.id, ...docSnapshot.data() }; // creaza un obiect cu id-ul documentului si restul detaliilor
          const ownerRef = doc(db, "users", flat.userId); //ne folosim de userId-ul din apartament pt a identifica owner-ul
          if (ownerRef) {
            const ownerDoc = await getDoc(ownerRef); //daca avem ownerRef se solicita din baza de date documentul cu detaliile utilizatorului (owner-ul)
            if (ownerDoc.exists()) {
              const ownerData = ownerDoc.data(); //daca ownerDoc exista, se extrag datele
              flat.ownerName = `${ownerData.firstName} ${ownerData.lastName}`; //se adauga in obiectul flat, ownerName si ownerEmail
              flat.ownerEmail = ownerData.email;
            }
          }
          return flat; //se returneaza obiectul flat completat cu noile proprietati pentru a fi inclus in array-ul flatsData
        })
      );
      setFlats(flatsData); //se seteaza starea flats cu flatsData
      setLoading(false);
    };
    const fetchFavorites = async () => {
      const favoritesCollection = collection(db, "userFavorites");
      const favoritesQuery = query(
        favoritesCollection,
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(favoritesQuery);
      const favoritesData = querySnapshot.docs.map((doc) => doc.data().flatId);
      setFavorites(favoritesData);
    };

    if (userId) {
      fetchFlats();
      fetchFavorites();
    }
  }, [userId]); //la schimbarea userId se aplereaza din nou fecthFLats() si fetchFavorites() pentru a aduce datele necesare

  //functie asincrona pentru adaugarea proprietatii isFavourite la un apartament, in functie de apasarea butonului
  const toggleFavorite = async (flatId) => {
    try {
      const favoritesCollection = collection(db, "userFavorites"); //se creaza colectia userFavorites
      //se interogheaza colectia pentru a vedea daca se indeplinesc criteriile
      const favoriteDocQuery = query(
        favoritesCollection,
        where("userId", "==", userId),
        where("flatId", "==", flatId)
      );
      const querySnapshot = await getDocs(favoriteDocQuery); //se returneaza documentele care indeplinesc conditia de mai sus

      if (querySnapshot.empty) {
        await addDoc(favoritesCollection, { userId, flatId }); //daca interogarea nu returneaza niciun document. se adauga unul nou cu userId si flatId
      } else {
        const favoriteDocId = querySnapshot.docs[0].id;
        const favoriteDocRef = doc(db, "userFavorites", favoriteDocId);
        await deleteDoc(favoriteDocRef); //daca documentul exista, se sterge documentul gasit
      }
      setFavorites((prevFavorites) =>
        prevFavorites.includes(flatId)
          ? prevFavorites.filter((id) => id !== flatId) //daca flatId este deja in favorite, este eliminat, daca nu, este adugat
          : [...prevFavorites, flatId]
      );
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  //cand un camp de input din sectiunea filtrare este modificat se declanseaza aceasta functie pentru a fi actualizata starea filters cu noile valori introduse de utilizator
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  //functie pentru actualizarea starii sortCriteria in functie de elementul de sortare selectat din dropdown list
  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  //functie de actualizare a starii sortOrderChange in functie de apasarea butonului, daca initial a fost asc schimba in desc si invers
  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  //functie de resetare a campurilor de filtrare si sortare la valorile initiale
  const resetFiltersAndSort = () => {
    setFilters({
      city: "",
      minPrice: "",
      maxPrice: "",
      minSize: "",
      maxSize: "",
    });
    setSortCriteria("");
    setSortOrder("asc");
  };

  //crearea unui array care va contine doar apartamentele care indeplinesc conditiile de filtrare
  const filteredFlats = flats.filter((flat) => {
    return (
      (filters.city === "" ||
        flat.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (filters.minPrice === "" || flat.price >= parseFloat(filters.minPrice)) &&
      (filters.maxPrice === "" || flat.price <= parseFloat(filters.maxPrice)) &&
      (filters.minSize === "" || flat.size >= parseFloat(filters.minSize)) &&
      (filters.maxSize === "" || flat.size <= parseFloat(filters.maxSize))
    );
  });

  //se creaza o copie a array-ului filteredFlats pentru a nu-l modifica pe acela in procesul de sortare
  const sortedFlats = [...filteredFlats].sort((a, b) => {
    let compare = 0;
    switch (sortCriteria) {
      case "city":
        compare = a.city.localeCompare(b.city);
        break;
      case "price":
        compare = a.price - b.price;
        break;
      case "size":
        compare = a.size - b.size;
        break;
      default:
        break;
    }
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Flats</h1>
      {/* in functie de valoarea isLoading se afiseaza sau nu loaderul astfel incat pana se incarca datele utilizatorul sa stie ca aplicatia lucreaza */}
      {loading ? (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <div className={styles.loadingText}>
            Stay cool... and don't overREACT ⚛️
          </div>
        </div>
      ) : (
        <>
          {/* afisare optiuni de filtrare */}
          <div className={styles.filterContainer}>
            <h2>Filter Options:</h2>
            <div className={styles.inputFilterFieldsContainer}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={filters.city}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="minSize"
                placeholder="Min Size"
                value={filters.minSize}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="maxSize"
                placeholder="Max Size"
                value={filters.maxSize}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* afisare optiuni de sortare */}
          <div className={styles.sortContainer}>
            <h2>Sort Options:</h2>
            <select
              className={styles.selectOptionButton}
              onChange={handleSortChange}
              value={sortCriteria}
            >
              <option value="">Select</option>
              <option value="city">City</option>
              <option value="price">Price</option>
              <option value="size">Size</option>
            </select>
            <button
              className={styles.ascDescButton}
              onClick={handleSortOrderChange}
            >
              {sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            </button>
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
            <div className={styles.gridHeader}>City</div>
            <div className={styles.gridHeader}>Address</div>
            <div className={styles.gridHeader}>Size</div>
            <div className={styles.gridHeader}>Has Ac</div>
            <div className={styles.gridHeader}>Year Build</div>
            <div className={styles.gridHeader}>Price</div>
            <div className={styles.gridHeader}>Date Available</div>
            <div className={styles.gridHeader}>Owner Name</div>
            <div className={styles.gridHeader}>Owner Email</div>
            <div className={styles.gridHeader}>Mark as Favourite</div>
            <div className={styles.gridHeader}>Action</div>
            {/* se itereaza prin array si se afiseaza informatiile in functie de filtrele activate */}
            {sortedFlats.map((flat) => (
              <React.Fragment key={flat.id}>
                <div className={styles.gridItem}>{flat.city}</div>
                <div className={styles.gridItem}>
                  {flat.streetName} {flat.streetNumber}
                </div>
                <div className={styles.gridItem}>{flat.size} m²</div>
                <div className={styles.gridItem}>
                  {flat.hasAc ? "Yes" : "No"}
                </div>
                <div className={styles.gridItem}>{flat.yearBuild}</div>
                <div className={styles.gridItem}>{flat.price} €</div>
                <div className={styles.gridItem}>{flat.availableDate}</div>
                <div className={styles.gridItem}>{flat.ownerName}</div>
                <div className={styles.gridItem}>{flat.ownerEmail}</div>
                <div className={styles.gridItem}>
                  <p
                    className={`${styles.favouriteIcon} ${
                      favorites.includes(flat.id) ? styles.heartRed : ""
                    }`}
                    onClick={() => toggleFavorite(flat.id)}
                  >
                    {favorites.includes(flat.id) ? "❤️" : "🤍"}
                  </p>
                </div>
                <div className={`${styles.gridItem} ${styles.actionContainer}`}>
                  <NavLink
                    className={styles.linkViewDetails}
                    to={`/flat/${flat.id}`}
                  >
                    View Details
                  </NavLink>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* creare tabel cu cap de tabel vertical pentru gestionare design la rezoluții mici */}
          <div className={styles.verticalTable}>
            {sortedFlats.map((flat) => (
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
                  Price: {flat.price} €
                  <br />
                  Available from: {flat.availableDate}
                </div>
                <div className={styles.verticalHeader}>Owner Info</div>
                <div className={styles.verticalItem}>
                  {flat.ownerName} {flat.ownerEmail}
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
                    <p
                      className={`${styles.favouriteIcon} ${
                        favorites.includes(flat.id) ? styles.heartRed : ""
                      }`}
                      onClick={() => toggleFavorite(flat.id)}
                    >
                      {favorites.includes(flat.id) ? "❤️" : "🤍"}
                    </p>
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
      )}
    </div>
  );
};

export default HomePage;
