import React from 'react';
import Swal from 'sweetalert2';
import './Logout.css';
import { useTranslation } from 'react-i18next';

const Logout = ({ setIsAuthenticated }) => {
  const { t } = useTranslation();
  const handleLogout = () => {
    Swal.fire({
      icon: 'question',
      title: t('logout.confirm_title'),
      text: t('logout.confirm_text'),
      showCancelButton: true,
      confirmButtonText: t('logout.confirm_button'),
    }).then(result => {
      if (result.value) {
        Swal.fire({
          timer: 1500,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            localStorage.setItem('is_authenticated', false);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          },
        });
      }
    });
  };

  return (
    <button
      style={{ marginLeft: '12px' }}
      className="muted-button"
      onClick={handleLogout}
    >
      {t('logout.button_text')}
    </button>
  );
};

export default Logout;