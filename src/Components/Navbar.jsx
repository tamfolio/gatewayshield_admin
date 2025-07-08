import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Text */}
          <div className="flex items-center">
            <img src="/assets/Logomark.svg" alt="Gateway Shield Logo" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Gateway Shield
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
