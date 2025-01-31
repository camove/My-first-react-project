import React, { useContext, useEffect, useState } from "react";
import styles from "./EditFlat.module.css";
import {
  Form,
  useLoaderData,
  useActionData,
  useParams,
  redirect,
} from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import FlatFormFields from "../Utils/FlatFormFields";

export const loaderEditFlat = async ({ params }) => {
  const flatId = params.id; // obtinem flatId din URL

  const flatDocRef = doc(db, "flats", flatId);
  const flatDoc = await getDoc(flatDocRef);

  if (flatDoc.exists()) {
    return flatDoc.data(); // returneaza datele apartamentului
  } else {
    return null;
  }
};

export const actionEditFlat = async ({ request }) => {
  const formData = await request.formData();
  const flatId = formData.get("flatId");

  const updatedData = {
    city: formData.get("city"),
    streetName: formData.get("streetName"),
    streetNumber: formData.get("streetNumber"),
    size: formData.get("size"),
    hasAc: formData.get("hasAc"),
    yearBuild: formData.get("yearBuild"),
    price: formData.get("price"),
    availableDate: formData.get("availableDate"),
  };

  try {
    const flatDocRef = doc(db, "flats", flatId);
    await updateDoc(flatDocRef, updatedData);
    toast.success("Flat updated successfully");
    return redirect(`/flat/${flatId}`);
  } catch (error) {
    toast.error("Failed to update flat");
    console.error("Failed to update flat", error);
    return { success: false, error };
  }
};

const EditFlat = () => {
  const { id } = useParams(); // obtinem flatId din URL
  const flatData = useLoaderData();
  const actionData = useActionData();

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

  useEffect(() => {
    if (flatData) {
      setFormData({
        city: flatData.city || "",
        streetName: flatData.streetName || "",
        streetNumber: flatData.streetNumber || "",
        size: flatData.size || "",
        hasAc: flatData.hasAc || "",
        yearBuild: flatData.yearBuild || "",
        price: flatData.price || "",
        availableDate: flatData.availableDate || "",
      });
    }
  }, [flatData]);

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

    if (!value) {
      error = `${name} is required.`;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  return (
    <div>
      <div>
        <Toaster />
      </div>
      <Form method="post" action={`/edit-flat/${id}`}>
        <input type="hidden" name="flatId" value={id} />
        <FlatFormFields
          formData={formData}
          setFormData={handleInputChange}
          errors={errors}
          validate={validate}
        />
        <div className={styles.buttonContainer}>
          <button className={styles.button} type="submit">
            Update Flat
          </button>
        </div>
      </Form>
    </div>
  );
};

export default EditFlat;
