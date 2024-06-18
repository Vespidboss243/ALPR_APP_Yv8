import React, { useEffect, useState } from "react"; // Importar el hook useEffect y useState
import "./Dashboard.css"; // Importar el archivo de estilos
import Swal from 'sweetalert2'; // Importar la librería de SweetAlert2
import { useTranslation } from "react-i18next"; // Importar el hook useTranslation
import { io } from "socket.io-client"; // Importar la librería de Socket.io

const Table = ({ handleEdit, handleDelete }) => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);


  useEffect(() => {
    // Función para obtener los datos de la API
    const fetchParking = async () => {
      try {
        const response = await fetch('http://localhost:6970/get',{
          method: 'GET',
          headers: {
            'token': localStorage.getItem('token')
          }
        });  // Asegúrate de que la ruta sea correcta
        const data = await response.json();
        setEmployees(data.map((employee, i) => ({ ...employee, checked: false })));
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    // Llama a la función para obtener los datos
    fetchParking();

    const socket = io('http://localhost:6970');

    // Escuchar mensajes del servidor WebSocket
    socket.on('new_data', async (data) => {
      if (data.message === 'plate found') {    
            Swal.fire({
              timer: 500,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading();
              },
              willClose: () => {
                Swal.fire({
                  icon: 'success',
                  title: t('Placa '+data.plate+' Reconocida Correctamente'),
                  showConfirmButton: false,
                  timer: 2000,
                });
              },
            });
          } else {
            Swal.fire({
              timer: 500,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading();
              },
              willClose: () => {
                Swal.fire({
                  icon: 'error',
                  title: t('Placa No Reconocida'),
                  text: t('Placa '+data.plate+' No Reconocida, Porfavor Revisar'),
                  showConfirmButton: true,
                });
              },
            });
          }
      });

    // Limpiar la conexión WebSocket cuando el componente se desmonte
    return () => {
      socket.close();
    };
  }, []);
  // Función para manejar el cambio de estado del checkbox
  const handleCheckboxChange = (id_) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id_ === id_ ? { ...employee, checked: !employee.checked } : employee
      )
    );
  };
  // Filtrar los empleados activos
  const activeEmployees = employees.filter(employee => employee.status === 'active');
  return (
    <div className="contain-table">
      <table className="striped-table">
        <thead>
          <tr>
            <th>{t("No.")}</th>
            <th>{t("name")}</th>
            <th>{t("license_plate")}</th>
            <th>{t("house")}</th>
            <th>{t("car_model")}</th>
            <th>{t("in_time")}</th>
            <th>{t("out_time")}</th>
            <th>{t("inside")}</th>
            <th colSpan={2} className="text-center">
              {t("actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {activeEmployees.length > 0 ? (
            activeEmployees.map((employee, i) => (
              <tr key={i}>
                <td>{i}</td>
                <td>{employee.username}</td>
                <td>{employee.plate}</td>
                <td>{employee.house}</td>
                <td>{employee.model}</td>
                <td>{employee.in_time}</td>
                <td>{employee.out_time}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={employee.inside}
                    onChange={() => handleCheckboxChange(employee.id_)}
                  />
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleEdit(employee.id_)}
                    className="button muted-button"
                  >
                    {t("dashboard.edit")}
                  </button>
                </td>
                <td className="text-left">
                  <button
                    onClick={() => handleDelete(employee.id_)}
                    className="button muted-button"
                  >
                    {t("dashboard.delete_confirm_button")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>{t("dashboard.no_users")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

