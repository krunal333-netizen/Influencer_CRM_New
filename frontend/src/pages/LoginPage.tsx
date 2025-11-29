import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { loginRequest } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { AuthResponse } from '../types/auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation<AuthResponse, AxiosError<{ message?: string }>, LoginFormValues>({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setUser(data.user);
      navigate('/dashboard');
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back 👋</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in with your credentials to continue.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="you@company.com"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>}
          </div>

          {loginMutation.isError && (
            <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {loginMutation.error.response?.data?.message ?? 'Unable to log you in. Double-check your credentials.'}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-brand-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-brand-primary hover:text-brand-accent">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
