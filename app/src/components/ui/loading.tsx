'use client';

type LoadingSize = 'sm' | 'md' | 'lg';

type LoadingProps = {
  size?: LoadingSize;
  message?: string;
};

const sizeStyles: Record<LoadingSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Loading({ size = 'md', message }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8" role="status">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeStyles[size]}`}
        aria-hidden="true"
      />
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
      <span className="sr-only">読み込み中</span>
    </div>
  );
}
