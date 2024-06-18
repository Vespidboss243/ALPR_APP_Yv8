import React, { useState } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const Add = ({ employees, setEmployees, setIsAdding }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [plate, setPlate] = useState("");
  const [house, setHouse] = useState("");
  const [model, setModel] = useState("");
  const [in_time, setIn_time] = useState("");
  const [out_time, setOut_time] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!username || !plate|| !house|| !model|| !in_time || !out_time) {
      return Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("all_fields_required"),
        showConfirmButton: true,
      });
    }

    const id = employees.length + 1;
    const newEmployee = {
      id,
      username,
      plate,
      house,
      model,
      in_time,
      out_time,
    };

    const response = await fetch("http://localhost:6970/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify(newEmployee),
    });

    if (response.ok) {
      setEmployees([
        ...employees,
        { ...newEmployee, id: employees.length + 1, checked: false },
      ]);
      setIsAdding(false);

      Swal.fire({
        icon: "success",
        title: t("added"),
        text: `${username} ${t("has_been_added")}`,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <div className="edit-screen">
      <div className="edit-container">
        <div className="edit-box">
          <form onSubmit={handleAdd}>
            <h1  style = {{fontSize: "2em"}}>{t("add_vehicle")}</h1>
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
            <label htmlFor="email">{t("house")}</label>
            <input
              id="house"
              type="number"
              name="house"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            />
            <label htmlFor="salary">{t("car_model")}</label>
            <input
              id="salary"
              type="text"
              name="salary"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <label htmlFor="date">{t("in_time")}</label>
            <input
              id="date"
              type="date"
              name="date"
              value={in_time}
              onChange={(e) => setIn_time(e.target.value)}
            />
            <label htmlFor="outTime">{t("out_time")}</label>
            <input
              id="outTime"
              type="date"
              name="outTime"
              value={out_time}
              onChange={(e) => setOut_time(e.target.value)}
            />
            <div style={{ marginTop: "50px" }}>
              <input type="submit" value={t("add")} />
              <input
                style={{ marginLeft: "12px" }}
                className="muted-button"
                type="submit"
                value={t("cancel")}
                onClick={() => setIsAdding(false)}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
