import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function StoresPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Firms & Stores</h2>
          <p className="text-slate-600">Manage your organizational structure and store locations</p>
        </div>

        {/* Organization Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Your Organization</h3>
          {user?.firm ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{user.firm.name}</CardTitle>
                    <CardDescription>{user.firm.email}</CardDescription>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-4 font-semibold text-slate-900">Details</h4>
                    <div className="space-y-3">
                      {user.firm.phone && (
                        <div>
                          <p className="text-sm text-slate-500">Phone</p>
                          <p className="font-medium text-slate-900">{user.firm.phone}</p>
                        </div>
                      )}
                      {user.firm.address && (
                        <div>
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-medium text-slate-900">{user.firm.address}</p>
                        </div>
                      )}
                      {user.firm.city && (
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-medium text-slate-900">
                            {user.firm.city}
                            {user.firm.state && `, ${user.firm.state}`}
                            {user.firm.zipCode && ` ${user.firm.zipCode}`}
                          </p>
                        </div>
                      )}
                      {user.firm.country && (
                        <div>
                          <p className="text-sm text-slate-500">Country</p>
                          <p className="font-medium text-slate-900">{user.firm.country}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 font-semibold text-slate-900">Settings</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Organization settings and store management can be configured here.
                    </p>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 text-left text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                        Edit Organization Details
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                        Manage Store Locations
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6 text-center text-amber-800">
                <p className="mb-2">You are not currently associated with any organization.</p>
                <p className="text-sm">Contact your administrator to join an organization.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Store Locations Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Store Locations</h3>
          <Card>
            <CardContent className="pt-6 text-center text-slate-500">
              <p>Store locations will be displayed here once they are configured in the system.</p>
              <p className="text-sm mt-2">Stores are associated with your organization and can be used to organize campaigns.</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Team Members</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current User</CardTitle>
              <CardDescription>Users in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{user?.name}</p>
                    <p className="text-sm text-slate-600">{user?.email}</p>
                  </div>
                  <Badge variant="secondary">{user?.roles[0]?.name || 'User'}</Badge>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Team member management features will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
