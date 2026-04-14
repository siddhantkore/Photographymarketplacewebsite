import { Link } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Calendar } from 'lucide-react';

export function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading your profile...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're not logged in</h1>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <Link to="/login">
            <Button>Log in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={user.name} readOnly />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} readOnly />
              </div>
              <div>
                <Label htmlFor="joinDate">Member Since</Label>
                <Input
                  id="joinDate"
                  value={new Date(user.joinDate).toLocaleDateString()}
                  readOnly
                />
              </div>
              <Button type="button">Update Profile</Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-500">Joined</div>
                  <div className="font-medium text-gray-900">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
