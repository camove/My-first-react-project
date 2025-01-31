import React, { createContext, useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const AuthContext = createContext(null); //creare context pentru autentificare cu valoarea initiala null

const AuthProvider = ({ children }) => {
  //componenta care va oferi AuthContext componentelor copii
  const userIdFromLS = localStorage.getItem("userId"); // preluare userId din localstorage
  const [userId, setUserId] = useState(userIdFromLS); // definire stare userId cu valoare initiala preluata din LS
  const [loggedIn, setLoggedIn] = useState(null); //definire stare loggedIn cu valoare initiala null

  const [showWarningModal, setShowWarningModal] = useState(false);

  //hook React care se apeleaza la montarea componentei si ori de cate ori se schimba userId-ul si care preia datele utilizatorului in functie de Id
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setLoggedIn(userDoc.data()); //se actualizeaza tarea loggedIn
        } else {
          setUserId(null);
          setLoggedIn(null);
        }
      }
    };
    fetchUserData(); //se reapeleaza functia cand componenta se reincarca sau userId-ul se schimba
  }, [userId]);

  //in cazul in care se editeaza datele utilizatorului, state-ul loggedIn se actualizeaza cu noile date (util pentru a actualiza numele utilizatorului in mesajul din header); in componenta EditProfile este creat un eveniment userUpdated care semnaleaza actualizarea datelor utilizatorului si care declanseaza actualizarea state-ului loggedIn prin folosirea hook-ului useEffect
  useEffect(() => {
    const handleUserUpdated = (event) => {
      setLoggedIn((prevLoggedIn) => ({
        ...prevLoggedIn,
        ...event.detail,
      }));
    };
    window.addEventListener("userUpdated", handleUserUpdated);
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  //functie pentru a se face logout automat dupa trecerea a 60 minute
  const timerLogout = () => {
    setTimeout(() => {
      setShowWarningModal(true);
      setLoggedIn(null);
      setUserId(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("loginTime");
    }, 60 * 60 * 1000);
  };

  return (
    //Valorile exportate din AuthContext catre copii
    <AuthContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        userId,
        setUserId,
        timerLogout,
        showWarningModal,
        setShowWarningModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
