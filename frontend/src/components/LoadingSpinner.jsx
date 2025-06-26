export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span className={`inline-block ${sizeClasses[size]} border-2 border-black border-t-transparent rounded-full animate-spin`}></span>
      <span className="text-black font-medium text-base tracking-wide">Loading...</span>
    </div>
  );
}