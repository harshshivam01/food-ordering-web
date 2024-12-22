import React, { useState, useEffect } from 'react';
import { authService } from '../services/authuser';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <User size={64} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {user.fullname}
            </h1>
            <p className="text-gray-600 mt-2">{user.role}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>

            {user.role === 'admin' && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <MapPin className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Restaurant Address</p>
                  <p className="font-medium">{user.address || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 