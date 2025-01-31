import React from "react";
import styles from "./AppLayout.module.css";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

const AppLayout = () => {
  return (
    <div>
      <NavBar />
      <div className={styles.outlet}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
