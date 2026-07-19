import React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';

const Loader = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
        <Loader2 className="w-24 h-24 text-blue-400 animate-spin" />
      </div>
      <p className="mt-6 text-gray-400 text-lg">{message}</p>
      <div className="mt-4 flex gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default Loader;