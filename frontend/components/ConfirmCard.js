"use client";

export default function ConfirmCard({ message, onConfirm, onCancel }) {
  return (
    // Overlay
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      {/* Card */}
      <div className="bg-white shadow-lg p-6 rounded-lg max-w-md w-full space-y-4 border border-red-300 z-50 relative">
        <p className="text-red-600 font-semibold">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Yes , I Agree
          </button>
        </div>
      </div>
    </div>
  );
}