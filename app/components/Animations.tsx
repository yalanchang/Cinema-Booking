export default function Animations() {
    return (
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
  
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
  
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
  
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    );
  }