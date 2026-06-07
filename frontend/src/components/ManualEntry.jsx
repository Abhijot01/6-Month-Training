import { useState } from "react";
import "../styles/manualEntry.css";
import componentSchemas
from "../schemas/componentSchemas";

import {
  insertComponent,
}
from "../services/manualEntryService";

const ManualEntry = () => {

  const [component, setComponent] =
    useState("");

  const [formData, setFormData] =
    useState({});
  const [loading, setLoading] =
  useState(false);

  const schema =
    componentSchemas[component] || [];

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    setLoading(true);

    const payload = {

      category:
        component,

      data:
        formData,
    };

    const response =
      await insertComponent(payload);

    alert(response.message);

    setFormData({});

  } catch (err) {

    console.error(err);

    alert("Insert failed");

  } finally {

    setLoading(false);
  }
};

  return (

  <div className="manual-entry-page">

    <h1 className="manual-entry-title">
      Manual Component Entry
    </h1>

    <select

      className="component-dropdown"

      value={component}

      onChange={(e) => {

        setComponent(
          e.target.value
        );

        setFormData({});
      }}
    >

      <option value="">
        Select Component
      </option>

      {
        Object.keys(componentSchemas)
          .map((key) => (

            <option
              key={key}
              value={key}
            >
              {key}
            </option>
          ))
      }

    </select>

    {
      component && (

        <form
          onSubmit={handleSubmit}
        >

          <div
            className="manual-entry-form-grid"
          >

            {
              schema.map((field) => (

                <div

                  key={field.name}

                  className="
                    manual-entry-field
                  "
                >

                  <label
                    className="
                      manual-entry-label
                    "
                  >
                    {field.label}
                  </label>

                  <input

                    type={field.type}

                    name={field.name}

                    value={
                      formData[field.name]
                      || ""
                    }

                    onChange={
                      handleChange
                    }

                    className="
                      manual-entry-input
                    "
                  />
                </div>
              ))
            }

          </div>

          <button

            type="submit"

            disabled={loading}

            className="
              manual-entry-btn
            "
          >

            {
              loading
                ? "Inserting..."
                : "Insert Component"
            }

          </button>

        </form>
      )
    }

  </div>
);
};

export default ManualEntry;