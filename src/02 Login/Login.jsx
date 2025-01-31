import React, { useContext, useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../Context/AuthContext";
import { db } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import email from "../assets/envelope.svg";
import lock from "../assets/lock.svg";

const Login = () => {
  const { setUserId, setLoggedIn, timerLogout } = useContext(AuthContext); //cu useContext accesam setUserId si setLoggedIn din AuthCOntext pentru a le actualiza si pt a le putea folosi in alte componente
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // se declara starea formData si si functia de actualizare setFormData cu valorile initiale pentru pentru campurile e-mail si password
    email: "",
    password: "",
  });

  //functie care se apeleaza de fiecare data cand exista o modificare a valorilor din campul de input email sau password
  const handleChange = (e) => {
    const { name, value } = e.target; //prin destructurare se extrage name si value din e.target (elementul de input care a declansat evenimentul de schimbare)
    setFormData({ ...formData, [name]: value }); //cu spread operator se iau valorile existente din formData si se aduc in noul obiect, iar [name]: value actualizeaza proprietatea email sau password cu noua valoare introdusa de utilizator
  };

  //functie asincrona pentru cautarea in baza de date a utilizatorului care se logheaza
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", formData.email)
      );
      const querySnapshot = await getDocs(q);
      let userFound = null;
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.password === formData.password) {
          userFound = { id: doc.id, ...userData };
        }
      });

      if (userFound) {
        const dateNow = new Date();
        setUserId(userFound.id);
        setLoggedIn(userFound);
        localStorage.setItem("userId", userFound.id);
        localStorage.setItem( 
          "loginTime", //se salveaza in local storage ora si minutul la care utilizatorul s-a logat
          dateNow.toLocaleTimeString("en-us", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        timerLogout();  //se apeleaza functia de declansare delogare automata dupa 60 min de la momentul logarii
        navigate(`/user/${userFound.id}`); //daca credentialele utilizatorului sunt corecte si utilizatorul a fost gasit in baza de date acesta este redirectionat pe prima pagina din aplicatie
      } else {
        toast.error("Incorrect email or password");
      }
    } catch (error) {
      toast.error("Somethimg went wrong: " + error.message);
    }
  };

  const handleSubmit = () => {
    navigate("/register");
  };

  return (
    <div className={styles.container}>
      <div>
        <Toaster />
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={loginUser} className={styles.form}>
          <h1 className={styles.formTitle}>LOGIN</h1>
          <div className={styles.inputCell}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail:"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className={styles.inputIcons}>
              <img src={email} />
            </div>
          </div>
          <div className={styles.inputCell}>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password:"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className={styles.inputIcons}>
              <img src={lock} />
            </div>
          </div>

          <button className={styles.loginButton} type="submit">
            Login
          </button>
        </form>
      </div>
      <div className={styles.registerDiv}>
        <div>
          <h2>Want to discover your next home with ease,</h2>
          <p>and don't have an account?</p>
          <button
            className={styles.registerButton}
            type="submit"
            onClick={handleSubmit}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
