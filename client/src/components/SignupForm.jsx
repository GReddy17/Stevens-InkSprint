import { useState } from 'react';
import { Link } from 'react-router-dom';

const SignupForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    // Hook to backend
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Signup data:', formData);
    }
  };

  return (
    <div className="signup-form">
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        {/* Display Name */}
        <div>
          <label>Display Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
          />
          {errors.displayName && (
            <p className="error">{errors.displayName}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        {/* Submit */}
        <button type="submit">Create Account</button>
      </form>

      {/* Link to Login */}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default SignupForm;