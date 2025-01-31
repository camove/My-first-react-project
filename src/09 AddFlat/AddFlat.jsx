import React, { useContext, useState, useEffect } from "react";
import styles from "./AddFlat.module.css";
import { Form, useActionData, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import FlatFormFields from "../Utils/FlatFormFields";

//citirea datelor din formular (campurile de input), validarea acestora si adaugarea datelor în colectia flats din Firestore.
export const actionAddFlat = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get("userId");
  //creare obiect flatData cu valorile aduse din input
  const flatData = {
    city: formData.get("city"),
    streetName: formData.get("streetName"),
    streetNumber: formData.get("streetNumber"),
    size: formData.get("size"),
    hasAc: formData.get("hasAc") === "",
    yearBuild: formData.get("yearBuild"),
    price: formData.get("price"),
    availableDate: formData.get("availableDate"),
    userId,
    isFavourite: false,
  };

  //creare obiect gol errors, care ulterior se populeaza cu proprietatile email, password, etc care au valorile egale cu mesajul de eroare
  const errors = {};
  if (flatData.city.length < 2) {
    errors.city = "City must have at least two characters";
  }
  if (flatData.streetName.length < 2) {
    errors.streetName = "Street Name must have at least two characters";
  }
  if (isNaN(parseInt(flatData.size)) || parseInt(flatData.size) < 10) {
    errors.size = "Size must be a number and greater than 10 sq meters.";
  }
  if (
    isNaN(parseInt(flatData.yearBuild)) ||
    parseInt(flatData.yearBuild) < 1000
  ) {
    errors.yearBuild = "Year build must be a number and greater than 1000";
  }
  const currentDate = new Date();
  const availableDate = new Date(flatData.availableDate);
  if (availableDate <= currentDate) {
    errors.availableDate = "Date must be in the future.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const flatsCollection = collection(db, "flats");
    await addDoc(flatsCollection, flatData);
    return { redirect: true };
  } catch (error) {
    console.error("Failed to add flat:", error);
    return { success: false, error: error.message };
  }
};

const AddFlat = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: "",
    streetName: "",
    streetNumber: "",
    size: "",
    hasAc: false,
    yearBuild: "",
    price: "",
    availableDate: "",
  });
  const [errors, setErrors] = useState({});
  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.redirect) {
      toast.success("Flat added successfully");
      setTimeout(() => {
        navigate(`/user/${userId}`);
      }, 2000);
    } else if (actionData?.errors) {
      toast.error("Failed to add flat. Please correct all the errors");
    }
  }, [actionData, navigate, userId]);

  // actualizeaza starea formularului pe baza inputului utilizatorului.
  const handleInputChange = (e) => {
    if (!e || !e.target) return;

    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // validari date din input
  const validate = (e) => {
    const { name, value } = e.target;
    let error = "";
    if (name === "city" && (!value || value.length < 2)) {
      error = "City is required and must be at least two letters long.";
    } else if (name === "streetName" && !value) {
      error = "Street name is required.";
    } else if (name === "streetNumber" && !value) {
      error = "Street number is required.";
    } else if (
      name === "size" &&
      (isNaN(parseInt(value)) || parseInt(value) < 10)
    ) {
      error = "Size must be a number and greater than 10 sq meters.";
    } else if (
      name === "yearBuild" &&
      (isNaN(parseInt(value)) || parseInt(value) < 1000)
    ) {
      error = "Year build must be a number and greater than 1000.";
    } else if (name === "price" && !value) {
      error = "Price is required.";
    } else if (name === "availableDate") {
      const today = new Date();
      const inputDate = new Date(value);
      if (inputDate <= today) {
        error = "Available date must be in the future.";
      }
    }

    setErrors({ ...errors, [name]: error });
  };

  return (
    <div>
      <div>
        <Toaster />
      </div>
      <Form method="post" action="/add-flat" className={styles.form}>
        <input type="hidden" name="userId" value={userId} />
        <FlatFormFields
          formData={formData}
          setFormData={handleInputChange}
          errors={errors}
          validate={validate}
        />
        <div className={styles.buttonContainer}>
          <button className={styles.registerButton} type="submit">
            Add Flat
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AddFlat;
