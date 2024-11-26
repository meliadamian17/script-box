import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type = "info", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`alert alert-${type} shadow-lg max-w-md`}>
        <div className="flex items-center justify-between w-full">
          <span className="text-lg flex-grow">{message}</span>
          <button
            className="ml-8 btn btn-ghost btn-circle btn-sm"
            onClick={() => {
              setVisible(false);
              if (onClose) onClose();
            }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;


