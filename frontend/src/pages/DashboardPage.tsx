import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 md:p-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h2>
          <p className="text-slate-600">Here's an overview of your CRM dashboard.</p>
        </div>

        {/* Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Firm Context Card */}
          <Card>
            <CardHeader>
              <CardTitle>Firm Context</CardTitle>
              <CardDescription>Your organization details</CardDescription>
            </CardHeader>
            <CardContent>
              {user.firm ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">{user.firm.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{user.firm.email}</p>
                  </div>
                  {user.firm.city && (
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">
                        {user.firm.city}
                        {user.firm.state ? `, ${user.firm.state}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">You have not joined a firm yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Role Assignments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Role Assignments</CardTitle>
              <CardDescription>Your permissions and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
              {user.roles.length === 0 && (
                <p className="text-sm text-slate-500">No roles assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Cards */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Stats</h3>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total Influencers', value: 0, icon: '👥' },
              { label: 'Active Campaigns', value: 0, icon: '⚡' },
              { label: 'Products', value: 0, icon: '📦' },
              { label: 'Recent Documents', value: 0, icon: '📄' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation Info */}
        <Card className="border-brand-accent/20 bg-brand-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">
              Use the sidebar to navigate to different modules: <strong>Influencers, Campaigns, Products, Firms & Stores, Financial Overview, and Analytics.</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
