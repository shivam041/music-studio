// src/components/LoadingStudio.tsx
export function LoadingStudio() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Studio...</div>
        </div>
      </div>
    );
  }