import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { validateLoginForm } from '../../utils/validators';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AdminLogin = () => {
  usePageTitle('Admin Portal Login');
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const user = await adminLogin(formData.email, formData.password);
      toast.success(`Administrator session started: ${user.name}`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Administrator authentication failed.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="inline-flex p-2.5 bg-blue-50 text-blue-700 rounded-lg mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Admin Portal Login</h2>
        <p className="mt-1 text-xs text-gray-500">
          Restricted access for system administrators only
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Admin Email"
          id="admin-email"
          name="email"
          type="email"
          placeholder="admin@growthtech.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={Mail}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          id="admin-password"
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
          Access Admin Console
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-2">
        <div className="text-[11px] text-gray-400 bg-gray-50 p-2.5 rounded border border-gray-200 text-left">
          <span className="font-semibold text-gray-600 block">Default Demo Credentials:</span>
          Email: <code className="text-gray-800">admin@growthtech.com</code><br />
          Password: <code className="text-gray-800">Admin@1234</code>
        </div>

        <p className="text-xs text-gray-500 pt-1">
          Not an administrator?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            User Login
          </Link>
        </p>
      </div>
    </div>
  );
};

