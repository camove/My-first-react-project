import React from 'react';
import styles from './FlatFormFields.module.css'

const FlatFormFields = ({ formData = {}, setFormData, errors = {}, validate }) => {

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.inputCell}>
          <input type="text" name="city" placeholder="City:" value={formData.city || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.city && <p>{errors.city}</p>}
        </div>
        <div className={styles.inputCell}>
          <input type="text" name="streetName" placeholder="Street name:" value={formData.streetName || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.streetName && <p>{errors.streetName}</p>}
        </div>
        <div className={styles.inputCell}>
          <input type="text" name="streetNumber" placeholder="Street number:" value={formData.streetNumber || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.streetNumber && <p>{errors.streetNumber}</p>}
        </div>
        <div className={styles.inputCell}>
          <input type="number" name="size" placeholder="Size (sq meters):" value={formData.size || ''} onChange={setFormData} onBlur={validate} required />
          {errors.size && <p>{errors.size}</p>}
        </div>
        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}> 
            <input type="checkbox" name="hasAc" checked={formData.hasAc || false} onChange={setFormData} className={styles.customCheckbox}/> <span className={styles.customCheckboxIndicator}></span> Has AC </label>
          {errors.hasAc && <p>{errors.hasAc}</p>}
        </div>
        <div className={styles.inputCell}>
          <input type="number" name="yearBuild" placeholder="Year build:" value={formData.yearBuild || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.yearBuild && <p>{errors.yearBuild}</p>}
        </div>
        <div className={styles.inputCell}>
          <input type="number" name="price" placeholder="Monthly rent price (in Euro):" value={formData.price || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.price && <p>{errors.price}</p>}
        </div>
        <div className={styles.inputCell}>
          <input type="date" name="availableDate" placeholder="Date available:" value={formData.availableDate || ''} onChange={setFormData} onBlur={validate} required/>
          {errors.availableDate && <p>{errors.availableDate}</p>}
        </div>
      </div>
    </div>
  );
};

export default FlatFormFields;
