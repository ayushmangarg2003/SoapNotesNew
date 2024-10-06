// components/FileUpload.js
import React from 'react';

export default function FileUpload() {
    return (
        <div className="mt-6 border-dashed border-2 border-gray-400 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Please upload your desired SOAP format here</p>
            <input
                type="file"
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
            />
        </div>
    );
}
