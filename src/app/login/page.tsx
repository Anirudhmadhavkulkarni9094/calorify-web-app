'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { email, username, password, confirmPassword } = form;

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'login'
            ? { email, password }
            : { email, username, password }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `${mode === 'login' ? 'Login' : 'Signup'} failed`);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      router.push('/');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h1>

        {error && (
          <p className="mb-4 text-red-600 text-sm font-medium text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading
              ? mode === 'login'
                ? 'Logging in...'
                : 'Signing up...'
              : mode === 'login'
              ? 'Login'
              : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-sm text-purple-600 hover:underline mt-4"
          >
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
