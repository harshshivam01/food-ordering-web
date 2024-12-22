import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useToast = () => {
  const notifySuccess = (message) => {
    toast.success(message, {
      className: "bg-green-500 text-white rounded shadow-md",
    });
  };

  const notifyError = (message) => {
    toast.error(message, {
      className: "bg-red-500 text-white rounded shadow-md",
    });
  };

  return { notifySuccess, notifyError };
}; 