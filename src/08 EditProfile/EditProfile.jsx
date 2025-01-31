import React, { useEffect, useState } from "react";
import styles from "./EditProfile.module.css";
import {
  Form,
  useLoaderData,
  useActionData,
  useParams,
  redirect,
  useNavigate,
} from "react-router-dom";
import { emailPattern, passwordPattern } from "../Utils/UserFormFields";
import UserFormFields from "../Utils/UserFormFields";
import toast, { Toaster } from "react-hot-toast";
import {
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

//functie cu care verificam existenta e-mail-ului in baza de date, functie pe care o folosim ulterior in validarea campului email
const checkEmailExists = async (email, currentEmail) => {
  if (email === currentEmail) {
    return false; // nu considera eroare dacă email-ul este același cu cel curent
  }
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const actionEditProfile = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get("userId");

  const updatedData = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
  };

  const currentEmail = formData.get("currentEmail");
  const errors = {};
  if (!emailPattern.test(updatedData.email)) {
    errors.email = "Invalid e-mail format.";
  } else {
    const emailExists = await checkEmailExists(updatedData.email, currentEmail);
    if (emailExists) {
      errors.email = "Email already registered.";
    }
  }
  if (!passwordPattern.test(updatedData.password)) {
    errors.password =
      "Password must contain at least 6 characters: letters, numbers and one special character.";
  }
  if (updatedData.password !== formData.get("repeatPassword")) {
    errors.repeatPassword = "Passwords does not match.";
  }
  if (updatedData.firstName.length < 2) {
    errors.firstName = "First name must have at least two characters.";
  }
  if (updatedData.lastName.length < 2) {
    errors.lastName = "Last name must have at least two characters.";
  }
  const today = new Date();
  const birthDate = new Date(updatedData.birthDate);
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18 || age > 120) {
    errors.birthDate = "Age must be between 18 and 120 years.";
  }

  //creare array cu proprietatile din obiectul errors; daca array-ul nu este gol, inseamna ca avem campuri nevalide si returnam un boolean false de care ne folosim sa afisam mesajul de eroare
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, updatedData);

    window.dispatchEvent(
      new CustomEvent("userUpdated", { detail: updatedData })
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile", error);
    return { success: false, error: error.message };
  }
};

// functie loader pentru a obtine datele utilizatorului
export const loaderEditProfile = async ({ params }) => {
  const userId = params.id; // obtine userId din URL

  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data(); // returneaza datele utilizatorului
  } else {
    return null;
  }
};

const EditProfile = () => {
  const { id } = useParams();
  const userData = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    firstName: "",
    lastName: "",
    birthDate: "",
  });

  const [currentEmail, setCurrentEmail] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setFormData({
        email: userData.email || "",
        password: userData.password || "",
        repeatPassword: userData.password || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        birthDate: userData.birthDate || "",
      });
      setCurrentEmail(userData.email || "");
    }
  }, [userData]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Profile updated successfully");
      setTimeout(() => {
        navigate(`/user/${id}`);
      }, 2000);
    } else if (actionData?.errors) {
      setErrors(actionData.errors);
      toast.error("Please correct all errors before submitting the form.");
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, navigate, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validate = async (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "email") {
      if (!emailPattern.test(value)) {
        error = "Email-ul este invalid.";
      } else if (value !== currentEmail) {
        const emailExists = await checkEmailExists(value, currentEmail);
        if (emailExists) {
          error = "Email-ul este deja înregistrat.";
        }
      }
    } else if (name === "password" && !passwordPattern.test(value)) {
      error =
        "Parola trebuie să aibă cel puțin 6 caractere, litere, cifre și un caracter special.";
    } else if (name === "repeatPassword" && value !== formData.password) {
      error = "Parolele nu se potrivesc.";
    } else if ((name === "firstName" || "lastName") && value.length < 2) {
      error = "Numele trebuie să aibă cel puțin 2 caractere.";
    } else if (name === "birthDate") {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 120) {
        error = "Vârsta trebuie să fie între 18 și 120 de ani.";
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  return (
    <div>
      <div>
        <Toaster />
      </div>
      <Form
        method="post"
        action={`/edit-profile/${id}`}
        className={styles.form}
      >
        <input type="hidden" name="userId" value={id} />
        <input type="hidden" name="currentEmail" value={currentEmail} />
        <UserFormFields
          formData={formData}
          setFormData={handleInputChange}
          errors={errors}
          validate={validate}
        />
        <div className={styles.buttonContainer}>
          <button className={styles.saveButton} type="submit">
            Save Changes
          </button>
        </div>
      </Form>
    </div>
  );
};

export default EditProfile;
