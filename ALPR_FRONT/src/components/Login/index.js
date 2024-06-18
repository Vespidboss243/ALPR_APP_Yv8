import React, { useState } from 'react';
import Swal from 'sweetalert2';
import imagen from '../../assets/imagen.png';
import './Login.css';
import { useTranslation } from 'react-i18next';

const Login = ({ setIsAuthenticated }) => {



  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async e => {
    e.preventDefault();

    async function login(username, password) {
      const url = "http://127.0.0.1:6970/login"; // TODO: no quemar la URL
      const data = {
        username: username,
        password: password
      };
    
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const responseData = await response.json();
        localStorage.setItem('token', responseData.token);
        return true;
      } else {
        return false;
      }
    }

    if (await login(email, password)) {
      Swal.fire({
        timer: 1500,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {

          localStorage.setItem('is_authenticated', true);
          setIsAuthenticated(true);

          Swal.fire({
            icon: 'success',
            title: t('login_success'),
            showConfirmButton: false,
            timer: 1500,
          });
        },
      });
    } else {
      Swal.fire({
        timer: 1500,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          Swal.fire({
            icon: 'error',
            title: t('login_error'),
            text: t('incorrect_credentials'),
            showConfirmButton: true,
          });
        },
      });
    }


  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className='login-screen'>
      <div className="login-container">
        <div class="icon-container">
          <img src={imagen} alt="Login logo" class="login-photo" />
        </div>
        <div className="login-box">
          <form onSubmit={handleLogin}>
            <h1>PIARPIS</h1>
            <label htmlFor="email">{t('email')}</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder=""
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label htmlFor="password">{t('password')}</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder=""
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input style={{ marginTop: '12px' }} type="submit" value={t('login')} />
            <div style={{ marginTop: '12px' }}>
              <button className='lng' onClick={() => changeLanguage('en')}>English</button>
              <button className='lng' onClick={() => changeLanguage('es')}>Español</button>
              <button className='lng' onClick={() => changeLanguage('fr')}>Français</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
