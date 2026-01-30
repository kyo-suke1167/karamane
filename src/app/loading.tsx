export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-10 w-10 border-4 border-amber-200 border-t-amber-500 rounded-full"></div>
        <p className="text-amber-500 font-bold text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}