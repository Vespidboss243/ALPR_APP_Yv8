import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Dashboard.css';
import Header from './Header';
import Table from './Table';
import Add from './Add';
import Edit from './Edit';
import { useTranslation } from 'react-i18next';

const Dashboard = ({ setIsAuthenticated }) => {
  const { t } = useTranslation();
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await fetch('http://localhost:6970/get', {
          method: 'GET',
          headers: {
            'token': localStorage.getItem('token')
          }
        });
        const data = await response.json();
        setParkings(data.map((parking, i) => ({ ...parking, checked: false })));
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchParkings();
  }, []);

  const handleEdit = id => {
    setSelectedParking(parkings.find(parking => parking.id_ === id));
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    
    Swal.fire({
      icon: 'warning',
      title: t('dashboard.delete_confirm_title'),
      text: t('dashboard.delete_confirm_text'),
      showCancelButton: true,
      confirmButtonText: t('dashboard.delete_confirm_button'),
      cancelButtonText: t('dashboard.delete_cancel_button'),
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:6970/delete/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'token': localStorage.getItem('token'),
            },
          });

          if (response.ok) {
            // Actualiza el estado de los empleados después de eliminar
            const parkingsCopy = parkings.filter(parking => parking.status === 'active');
            setParkings(parkingsCopy);

            Swal.fire({
              icon: 'success',
              title: 'Eliminado!',
              text: 'El registro ha sido eliminado.',
              showConfirmButton: false,
              timer: 1500,
              
            });
            window.location.reload();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Hubo un problema eliminando el registro.',
              showConfirmButton: true,
            });
          }
        } catch (error) {
          console.error("Error deleting parking:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Hubo un problema eliminando el registro.',
            showConfirmButton: true,
          });
        }
      }
      
    });

  };

  return (
    <div id="table-main-screen">
      <div className="container">
        {!isAdding && !isEditing && (
          <div className='table-screen'>
            <Header
              setIsAdding={setIsAdding}
              setIsAuthenticated={setIsAuthenticated}
            />
            <div style={{ marginTop: '9vh', marginBottom: '4vh' }}></div>
            <div className="table-container">
              <Table
                employees={parkings}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          </div>
        )}
        {isAdding && (
          <Add
            employees={parkings}
            setEmployees={setParkings}
            setIsAdding={setIsAdding}
          />
        )}
        {isEditing && (
          <Edit
            employees={parkings}
            selectedEmployee={selectedParking}
            setEmployees={setParkings}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
      <div className="wallpaper"></div>
    </div>
  );
};

export default Dashboard;


