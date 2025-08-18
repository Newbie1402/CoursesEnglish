import React from 'react';
import { cn } from '@/lib/utils';

const ProfileCard = ({ teacher }) => {
  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <img
          src={teacher.avatar}
          alt={teacher.name}
          className="w-24 h-24 rounded-full border-4 border-blue-100 hover:border-blue-200 transition duration-300"
        />
        <div className="absolute bottom-0 right-0 bg-green-400 w-4 h-4 rounded-full border-2 border-white"></div>
      </div>
      <h2 className="text-xl font-semibold mt-4 text-gray-800">{teacher.name}</h2>
      <p className="text-blue-600 font-medium">{teacher.role}</p>
      <p className="text-gray-500 text-sm">{teacher.email}</p>
    </div>
  );
};

export default ProfileCard;
