"use client"; // Required for components with event listeners like the mobile menu toggle
import { FcBiotech } from "react-icons/fc";
import Image from "next/image";
import React from "react";
// We need flowbite for the mobile menu toggle to work
// Note: The 'flowbite.js' script must be included in your main HTML file (e.g., public/index.html)
// for the mobile menu dropdown to function, as it cannot be imported here.

const Navbar = () => {
  return (
    <nav
      className="bg-white/10 backdrop-blur-md border-b border-white/10 dark:bg-black/10
                 sticky top-0 left-0 right-0 z-50 w-full max-h-[70px]"
    >
      <div className="max-w-screen flex flex-wrap items-center justify-between mx-10 p-4">
        {/* Logo and Title */}
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Reverted to standard <img> tag */}
          <FcBiotech
            className="h-10" // Re-added height class
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            NextTraj
          </span>
        </a>

        {/* Mobile Menu Toggle Button */}
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only"></span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Links Menu */}
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          {/* Glassmorphic background for the mobile dropdown */}
          <ul
            className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-700 rounded-lg 
                       bg-black/20 md:bg-transparent 
                       md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0"
          >
            <li>
              {/* Reverted to standard <a> tag */}
              <a
                href="/"
                className="block py-2 px-3 text-white rounded bg-blue-600 md:bg-transparent md:text-blue-500 md:p-0"
                aria-current="page"
              >
                viewport
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
