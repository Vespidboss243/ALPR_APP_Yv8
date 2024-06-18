import React, { useState } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const Edit = ({ employees, selectedEmployee, setEmployees, setIsEditing }) => {
  const id_ = selectedEmployee.id_;
  const { t } = useTranslation();
  const [username, setUsername] = useState(selectedEmployee.username);
  const [plate, setPlate] = useState(selectedEmployee.plate);
  const [house, setHouse] = useState(selectedEmployee.house);
  const [model, setModel] = useState(selectedEmployee.model);
  const [in_time, setInTime] = useState(selectedEmployee.in_time);
  const [out_time, setOutTime] = useState(selectedEmployee.out_time);
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!username || !plate || !house || !model || !in_time || !out_time) {
      return Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("all_fields_required"),
        showConfirmButton: true,
      });
    }

    const updatedEmployee = {
      username,
      plate,
      house,
      model,
      in_time,
      out_time,
    };

    try {
      const ruta = "http://localhost:6970/update/" + id_;
      console.log("ruta", ruta);
      const response = await fetch(ruta, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedEmployee),
      });

      if (response.ok) {
        const updatedList = employees.map((emp) =>
          emp.id_ === selectedEmployee.id_ ? { ...emp, ...updatedEmployee } : emp
        );
        setEmployees(updatedList);
        setIsEditing(false);

        Swal.fire({
          icon: "success",
          title: t("updated"),
          text: `${username} ${t("has_been_updated")}`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: errorData.message,
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("update_failed"),
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="edit-screen">
      <div className="edit-container">
        <div className="edit-box">
          <form onSubmit={handleUpdate}>
            <h1 style = {{fontSize: "2em"}}>{t("edit_vehicle")}</h1>
            <label htmlFor="username">{t("name")}</label>
            <input
              id="username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="plate">{t("license_plate")}</label>
            <input
              id="plate"
              type="text"
              name="plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
            <label htmlFor="house">{t("house")}</label>
            <input
              id="house"
              type="number"
              name="house"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            />
            <label htmlFor="model">{t("car_model")}</label>
            <input
              id="model"
              type="text"
              name="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <label htmlFor="in_time">{t("in_time")}</label>
            <input
              id="in_time"
              type="date"
              name="in_time"
              value={in_time}
              onChange={(e) => setInTime(e.target.value)}
            />
            <label htmlFor="out_time">{t("out_time")}</label>
            <input
              id="out_time"
              type="date"
              name="out_time"
              value={out_time}
              onChange={(e) => setOutTime(e.target.value)}
            />
            <div style={{ marginTop: "50px" }}>
              <input type="submit" value={t("update")} />
              <input
                style={{ marginLeft: "12px" }}
                className="muted-button"
                type="submit"
                value={t("cancel")}
                onClick={() => setIsEditing(false)}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;

