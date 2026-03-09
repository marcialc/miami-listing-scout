interface ToastProps {
  message: string;
  type: "success" | "error";
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-[slideIn_0.2s_ease-out]">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          type === "success"
            ? "bg-accent-600 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
