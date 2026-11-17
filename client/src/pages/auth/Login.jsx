import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { validateLoginForm } from '../../utils/validators';
import { Eye, EyeOff, Mail, Lock, ShieldAlert } from 'lucide-react';

export const Login = () => {
  usePageTitle('Sign In');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError('');
      const loggedInUser = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${loggedInUser.name}`);

      // If admin, redirect to admin dashboard; else regular dashboard
      if (loggedInUser.role?.name === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from === '/admin/dashboard' ? '/dashboard' : from, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Unable to log in. Please check your credentials.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="mt-1 text-xs text-gray-500">
          Enter your credentials to access your workspace
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="you@growthtech.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={Mail}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={Lock}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-3">
        <p className="text-xs text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create an account
          </Link>
        </p>

        <p className="text-xs text-gray-500">
          Are you a platform administrator?{' '}
          <Link
            to="/admin/login"
            className="font-medium text-gray-800 hover:text-blue-600 hover:underline"
          >
            Admin Portal Login
          </Link>
        </p>
      </div>
    </div>
  );
};

