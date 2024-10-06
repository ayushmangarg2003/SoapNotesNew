// components/Loader.js
import React from 'react';

export default function Loader({ text }) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            <p className="mt-4 text-blue-500 text-lg font-semibold">{text}</p>
        </div>
    );
}
