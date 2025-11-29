import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-8 shadow">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Signed in as</p>
            <h1 className="text-3xl font-semibold text-slate-900">{user.name}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
          >
            Log out
          </button>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Firm context</h2>
            {user.firm ? (
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{user.firm.name}</p>
                <p>{user.firm.email}</p>
                {user.firm.city && (
                  <p>
                    {user.firm.city}
                    {user.firm.state ? `, ${user.firm.state}` : ''}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">You have not joined a firm yet.</p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Role assignments</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span key={role.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {role.name}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Protected routes on the client are unlocked automatically after authentication.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
