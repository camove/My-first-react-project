import React from 'react';
import styles from './Footer.module.css';
import instagram from "../assets/instagram.svg";
import twitter from "../assets/x-twitter.svg";
import facebook from "../assets/facebook-f.svg";


const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h2>Contact Us</h2>
          <p>Email: contact@findmyplace.com</p>
          <p>Phone: +123 456 7890</p>
        </div>
        <div className={styles.footerSection}>
          <h2>Follow Us</h2>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={facebook} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={twitter} alt="Twitter" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src={instagram} alt="Instagram" />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        &copy; 2025 Find My Place. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
