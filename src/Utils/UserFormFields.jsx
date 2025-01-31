import React from 'react';
import styles from './UserFormFields.module.css'
import email from "../assets/envelope.svg";
import lock from "../assets/lock.svg";
import user from "../assets/user.svg";


export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

//componenta reutilizabila pentru Register si EditProfile; primeste props-urile formData(obiec cu valorile din input), setFormData (functie de actualizare pt formData), errors (obiect cu mesajele de eroare) si validate(functia de validare a campurilor de input)
const UserFormFields = ({ formData = {}, setFormData, errors = {}, validate }) => {
  return (
    <div className={styles.container} >
      <div className={styles.formContainer}>
        <div className={styles.inputCell}>
          <input 
            type="email" id="email" name="email" placeholder="E-mail:" value={formData.email || ''} onChange={setFormData} onBlur={validate} required />
          {errors.email && <p>{errors.email}</p>}
          <div className={styles.inputIcons}>
            <img src={email}/>
          </div>
        </div>
        <div className={styles.inputCell}>
          <input type="password" id="password" name="password" placeholder="Password:" value={formData.password || ''} onChange={setFormData} onBlur={validate} required />
          {errors.password && <p>{errors.password}</p>}
          <div className={styles.inputIcons}>
            <img src={lock}/>
          </div>
        </div>
        <div className={styles.inputCell}>
          <input type="password" id="repeatPassword" name="repeatPassword" placeholder="Repeat password:" value={formData.repeatPassword || ''} onChange={setFormData} onBlur={validate} required />
          {errors.repeatPassword && <p>{errors.repeatPassword}</p>}
          <div className={styles.inputIcons}>
            <img src={lock}/>
          </div>
        </div>
        <div className={styles.inputCell}>
          <input type="text" id="firstName" name="firstName" placeholder="First Name:" value={formData.firstName || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.firstName && <p>{errors.firstName}</p>}
          <div className={styles.inputIcons}>
            <img src={user}/>
          </div>
        </div>
        <div className={styles.inputCell}>
          <input type="text" id="lastName" name="lastName" placeholder="Last Name:" value={formData.lastName || ''} onChange={setFormData} onBlur={validate} required />
          {errors.lastName && <p>{errors.lastName}</p>}
          <div className={styles.inputIcons}>
            <img src={user}/>
          </div>
        </div>
        <div className={styles.inputCell}>
          <input type="date" id="birthDate" name="birthDate" placeholder="Birth Date:" value={formData.birthDate || ''} onChange={setFormData} onBlur={validate} required />
          {errors.birthDate && <p>{errors.birthDate}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserFormFields;

