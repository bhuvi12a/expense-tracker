'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiSave, FiLock, FiEdit2 } from 'react-icons/fi';

interface User {
  id: string;
  username: string;
  email: string;
}

interface ProfileFormData {
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData(prev => ({ ...prev, username: parsedUser.username }));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify({
          username: formData.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = {
          ...user,
          username: formData.username
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
        toast.success('Profile updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="text-blue-600 text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiEdit2 />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                required
                minLength={3}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <FiMail className="text-gray-500" />
                <span className="text-gray-500">{user.email}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {isEditing && (
              <>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Current Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmNewPassword}
                      onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                      className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                      minLength={6}
                    />
                  </div>
                </div>
              </>
            )}

            {isEditing && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {loading ? (
                  'Updating...'
                ) : (
                  <>
                    <FiSave />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 