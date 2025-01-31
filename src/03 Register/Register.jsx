import React from "react";
import styles from "./Register.module.css";
import { Form } from "react-router-dom";
import { db } from "../../firebase";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import UserFormFields from "../Utils/UserFormFields";
import { useEffect, useState } from "react";
import { useNavigate, useActionData } from "react-router-dom";
import { emailPattern, passwordPattern } from "../Utils/UserFormFields";
import toast, { Toaster } from "react-hot-toast";

//functie cu care verificam existenta e-mail-ului in baza de date, functie pe care o folosim ulterior in validarea campului email
const checkEmailExists = async (email) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const actionRegisterUser = async ({ request }) => {
  const formData = await request.formData();
  //se creaza obeciectul user cu proprietatile preluate din input-uri
  const user = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    isAdmin: false,
  };

  //creare obiect gol errors, care ulterior se populeaza cu proprietatile email, password, etc care au valorile egale cu mesajul de eroare
  const errors = {};
  if (!emailPattern.test(user.email)) {
    errors.email = "Invalid e-mail format.";
  } else {
    const emailExists = await checkEmailExists(user.email);
    if (emailExists) {
      errors.email = "Email already registered.";
    }
  }
  if (!passwordPattern.test(user.password)) {
    errors.password =
      "Password must contain at least 6 characters: letters, numbers and one special character.";
  }
  if (user.password !== formData.get("repeatPassword")) {
    errors.repeatPassword = "Passwords does not match.";
  }
  if (user.firstName.length < 2) {
    errors.firstName = "First name must have at least two characters.";
  }
  if (user.lastName.length < 2) {
    errors.lastName = "Last name must have at least two characters.";
  }
  const today = new Date();
  const birthDate = new Date(user.birthDate);
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18 || age > 120) {
    errors.birthDate = "Age must be between 18 and 120 years.";
  }

  //creare array cu proprietatile din obiectul errors; daca array-ul nu este gol, inseamna ca avem campuri nevalide si returnam un boolean false de care ne folosim sa afisam mesajul de eroare
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    await addDoc(collection(db, "users"), user); //adaugare utilizator in baza de date
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// creare obiect cu proprietati cu valori "" pentru gestionare valori initiale inputuri
const initialFormState = {
  email: "",
  password: "",
  repeatPassword: "",
  firstName: "",
  lastName: "",
  birthDate: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const actionData = useActionData();

  useEffect(() => {
    //daca avem salvare cu succes a utilizatorului
    if (actionData?.success) {
      setFormData(initialFormState); //resetam formularul
      setErrors({}); //golim obiectul cu mesajele de eroare
      toast.success("User added with success!"); //afisam toaster-ul cu mesaul de succes
      setTimeout(() => {
        navigate("/login");  //utilizatorul este redirectionat catre pagina de login dupa 2s de la inregistrarea cu succes
      }, 2000);
    } else if (actionData?.errors) {
      setErrors(actionData.errors);
      toast.error("Please correct all errors before submitting the form."); //toast cu mesaj de atentionare
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //verificare date introduse de utilizator in campurile de input(verificare imediat dupa introducerea datelor)
  const validate = async (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "email") {
      if (!emailPattern.test(value)) {
        error = "Invalid e-mail format.";
      } else {
        const emailExists = await checkEmailExists(value);
        if (emailExists) {
          error = "Email already registered.";
        }
      }
    } else if (name === "password" && !passwordPattern.test(value)) {
      error =
        "Password must contain at least 6 characters: letters, numbers and one special character.";
    } else if (name === "repeatPassword" && value !== formData.password) {
      error = "Passwords does not match.";
    } else if (
      (name === "firstName" || name === "lastName") &&
      value.length < 2
    ) {
      error = "Name must have at least two characters.";
    } else if (name === "birthDate") {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 120) {
        error = "Age must be between 18 and 120 years.";
      }
    }

    setErrors({ ...errors, [name]: error });
  };

  return (
    <div>
      <div>
        <Toaster />
      </div>
      <Form method="post" className={styles.form}>
        {/* apelare componenta UserFormFields */}
        <UserFormFields
          formData={formData}
          setFormData={handleInputChange}
          errors={errors}
          validate={validate}
        />
        <div className={styles.buttonContainer}>
          <button className={styles.registerButton} type="submit">
            Sign Up
          </button>
        </div>
      </Form>
    </div>
  );
};

export default Register;
