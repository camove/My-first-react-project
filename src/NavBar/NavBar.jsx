import { useContext, useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./NavBar.module.css";
import { AuthContext } from "../Context/AuthContext";
import Logout from "../06 Logout/Logout";
import DeleteAccount from "../07 DeleteAccount/DeleteAccount";
import SessionEnded from "../Utils/SessionEnded";
import logo from '../assets/Logo.png';
import xMark from "../assets/xmark.svg";
import bars from "../assets/bars.svg";

const NavBar = () => {
  const {
    loggedIn,
    userId,
    setUserId,
    showWarningModal,
    setShowWarningModal,
    handleLogout,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Extragem flatId din URL folosind useParams
  const { id: flatId } = useParams();

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId"); //se verifica local storage pentru a vedea daca avem user logat si se actualizeaza starea aferenta
    if (savedUserId) {
      setUserId(savedUserId);
    }
    setIsLoading(false);
  }, [setUserId]);

  useEffect(() => {
    if (isLoading) return;
    const publicPages = ["/login", "/register"]; //aici declaram paginile publice
    const isPublicPage = publicPages.includes(location.pathname); //aici cream un boolean. Daca locatia in care ne aflam exista pe lista de pagini publice, atunci isPublicPage va fi true
    if (!userId && !isPublicPage) {
      //daca nu suntem logati si nu suntem pe o pagina publica, atunci navigam catre pagina de login
      navigate("/login", { replace: true }); //{ replace: true } inlocuieste intrarea curenta din istoric cu una nouă, astfel incat utilizatorul nu poate reveni la pagini restrictionate folosind butonul de inapoi al browserului sau prin modificare URL
    }
  }, [userId, location, navigate, isLoading]);

  //gestionare stari pentru modalul de logout
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  //gestionare stari pentru modalul de deleteAccount
  const openDeleteAccountModal = () => {
    setIsDeleteAccountModalOpen(true);
  };

  const closeDeleteAccountModal = () => {
    setIsDeleteAccountModalOpen(false);
  };

  //functie toggle pentru gestionare stare meniu dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  //gestionam închiderea meniului dropdown atunci când utilizatorul dă click în afara acestuia
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !event.target.closest(`.${styles.hamburgerButton}`)
    ) {
      setIsMenuOpen(false);
      closeDropdown();
    }
  };

  //functie care defineste ce se intampla la apasarea butonului Delele Account: se inchide meniul dropdown, se inchide meniul, se deschide modalul
  const handleDeleteClick = () => {
    openDeleteAccountModal();
    closeDropdown();
    setIsMenuOpen(false);
  };

  //functie care defineste ce se intampla la apasarea butonului Logout: se inchide meniul dropdown, se inchide meniul, se deschide modalul
  const handleLogoutClick = () => {
    openLogoutModal();
    closeDropdown();
    setIsMenuOpen(false);
  };

  //event listener cu apelare functie handleClickOutside la fiecare click in afara meniului dropdown si scoaterea evenimentului la demontarea componentei
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className={styles.navBar}>
      {/* daca avem user logat se afiseaza mesajul de bun venit, varianta gasita pentru a-l putea afisa la rezolutii mai mici si in alta pozitie decat cea la rezolutii mai mari */}
      {loggedIn && (
        <>
          <div className={styles.welcomeMessageLowResolution}>
            <p>
              Welcome, {loggedIn.firstName} {loggedIn.lastName}!
            </p>
          </div>
        </>
      )}
      {/* alta ozitionare in NavBar pentru nume app, logo si slogan la rezolutii mici */}
      <div className={styles.logoContainerLowResolution}>
        <div>
          <h1>FIND MY PLACE</h1>
        </div>

        <div>
          <img className={styles.logo} src={logo} alt="logo" />
        </div>
        <div className={styles.slogan}>
          <h2>Discover your</h2>
          <h2>next home</h2>
          <h2>with ease.</h2>
        </div>
      </div>
      {/* creare meniu tip hamburger */}
      <button className={styles.hamburgerButton} onClick={toggleMenu}>
        {/* daca isMenuOpen este true se afiseaza iconita X, daca nu iconita 'hamburger'*/}
        {isMenuOpen ? (
          <div className={styles.closeIcon}>
            <img src={xMark} />
          </div>
        ) : (
          <div className={styles.hamburgerIcon}>
            <img src={bars} />
          </div>
        )}
      </button>
      {/* in functie valoarea isMenuOpen, div-ul pentru NavBar isi schimba clasa facand posibila afisarea meniului tip hamburger */}
      <div
        className={`${styles.navBarContainer} ${
          isMenuOpen ? styles.showMenu : ""
        }`}
      >
        {/* cand avem user logat se afiseaza meniul cu restul elementelor, mesaj, nume app, logo si slogan */}
        {loggedIn && (
          <>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.activeNavLink : styles.navLink
              }
              to={`/user/${userId}`}
            >
              Home
            </NavLink>
            <div className={styles.welcomeMessage}>
              <p>
                Welcome, {loggedIn.firstName} {loggedIn.lastName}!
              </p>
            </div>
            <div className={styles.logoContainer}>
              <div>
                <h1>FIND MY PLACE</h1>
              </div>

              <div>
                <img
                  className={styles.logo}
                  src={logo}
                  alt="logo"
                />
              </div>
              <div>
                <h2>Discover your next home with ease.</h2>
              </div>
            </div>

            <NavLink
              className={({ isActive }) =>
                isActive ? styles.activeNavLink : styles.navLink
              }
              to="/add-flat"
            >
              Add Flat
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.activeNavLink : styles.navLink
              }
              to="/my-flats"
            >
              My Flats
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.activeNavLink : styles.navLink
              }
              to="/favourites"
            >
              Favourites
            </NavLink>

            {/* in plus daca user-ul logat este si admin se afiseaza un meniu accesibil doar pentru admini */}
            {loggedIn.isAdmin && (
              <>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? styles.activeNavLink : styles.navLink
                  }
                  to="/all-users"
                >
                  All Users
                </NavLink>
              </>
            )}
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                className={styles.dropdownButton}
                onClick={toggleDropdown}
              >
                My Profile
              </button>
              <div
                className={`${styles.dropdownContent} ${
                  dropdownOpen ? styles.show : ""
                }`}
              >
                <NavLink
                  className={({ isActive }) =>
                    isActive ? styles.activeEditProfile : styles.editProfile
                  }
                  to={`/edit-profile/${userId}`}
                  onClick={() => {
                    closeDropdown();
                    setIsMenuOpen(false);
                  }}
                >
                  Edit Profile
                </NavLink>
                <button onClick={handleDeleteClick}>Delete Account</button>
                <button onClick={handleLogoutClick}>Logout</button>
              </div>
            </div>
          </>
        )}

        {/* daca nu avem utilizator logat, in meniu apare doar link-urile catre login si register plus elementele statice: nume app, logo si slogan */}
        {!loggedIn && (
          <>
            <NavLink
              className={({ isActive }) =>
                isActive ? styles.activeNavLink : styles.navLink
              }
              to="/login"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </NavLink>

            <div className={styles.logoContainer}>
              <div>
                <h1>FIND MY PLACE</h1>
              </div>

              <div>
                <img
                  className={styles.logo}
                  src={logo}
                  alt="logo"
                />
              </div>
              <div>
                <h2>Discover your next home with ease.</h2>
              </div>
            </div>

            <NavLink
              className={({ isActive }) =>
                isActive ? styles.activeNavLink : styles.navLink
              }
              to="/register"
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </NavLink>
          </>
        )}
        {/* apelarea componentelor Logout si DeleteAccount */}
        <Logout isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
        <DeleteAccount
          isOpen={isDeleteAccountModalOpen}
          onClose={closeDeleteAccountModal}
        />
        {showWarningModal && (
          <SessionEnded
            isOpen={showWarningModal}
            onClose={() => setShowWarningModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default NavBar;
