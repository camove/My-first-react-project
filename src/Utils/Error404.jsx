import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Error404.module.css';
import { AuthContext } from '../Context/AuthContext';

const Error404 = () => {

  const { userId } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404: Page not found!</h1>
      <p className={styles.message}>Oops... Lost in space? Let's get you back to reality 🚀</p>
      <NavLink className={styles.homeButton} to={`/user/${userId}`}>Take Me Home</NavLink>
    </div>
  );
};

export default Error404;
