import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { login, register } from '../redux/authSlice';
import { Button, Input } from './ui';
import { strings } from '../locales';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      await dispatch(register(formData));
    } else {
      await dispatch(login({ email: formData.email, password: formData.password }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 {strings.app.name}</h1>
          <p>{strings.app.tagline}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <Input
              type="text"
              name="username"
              label={strings.auth.username}
              value={formData.username}
              onChange={handleChange}
              required
              placeholder={strings.auth.usernamePlaceholder}
            />
          )}

          <Input
            type="email"
            name="email"
            label={strings.auth.email}
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={strings.auth.emailPlaceholder}
          />

          <Input
            type="password"
            name="password"
            label={strings.auth.password}
            value={formData.password}
            onChange={handleChange}
            required
            placeholder={strings.auth.passwordPlaceholder}
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" disabled={loading}>
            {loading
              ? strings.auth.processing
              : isRegister
                ? strings.auth.signUp
                : strings.auth.signIn}
          </Button>
        </form>

        <div className="login-footer">
          <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? strings.auth.alreadyHaveAccount : strings.auth.dontHaveAccount}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
