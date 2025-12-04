import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { registerRequest } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import type { AuthResponse, RegisterPayload } from '../types/auth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    firmId: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirmation must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const registerMutation = useMutation<AuthResponse, AxiosError<{ message?: string }>, RegisterPayload>({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      setUser(data.user);
      navigate('/dashboard');
    },
  });

  const onSubmit = ({ confirmPassword: _confirmPassword, ...rest }: RegisterFormValues) => {
    registerMutation.mutate(rest);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-xl">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold text-slate-900">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-500">Spin up a secure Influencer CRM account for your firm.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="Ava Reynolds"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="ava@brand.com"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="firmId">
              Firm ID (optional)
            </label>
            <input
              id="firmId"
              type="text"
              className="w-full rounded-lg border border-dashed border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="Connect to an existing firm"
              {...register('firmId')}
            />
            {errors.firmId && <p className="mt-1 text-sm text-rose-500">{errors.firmId.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="Strong password"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/40"
              placeholder="Repeat password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-rose-500">{errors.confirmPassword.message}</p>}
          </div>

          {registerMutation.isError && (
            <p className="md:col-span-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {registerMutation.error.response?.data?.message ?? 'Unable to create your account. Please try again.'}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-lg bg-brand-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {registerMutation.isPending ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:text-brand-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
