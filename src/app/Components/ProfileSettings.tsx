'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiUser, FiSave } from 'react-icons/fi';

interface User {
  username: string;
  email: string;
  id: string;
}

interface ProfileSettingsProps {
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
  currentUser: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose, onUpdate, currentUser }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUser.id
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = {
          ...currentUser,
          username: data.user.username
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUpdate(updatedUser);
        toast.success('Profile updated successfully');
        onClose();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FiUser className="text-blue-600" />
          Profile Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings; 