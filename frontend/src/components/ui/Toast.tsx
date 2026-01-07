import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#00ff88',
            secondary: '#0a0e27',
          },
        },
        error: {
          iconTheme: {
            primary: '#ff3366',
            secondary: '#0a0e27',
          },
        },
      }}
    />
  );
};

export default Toast;
