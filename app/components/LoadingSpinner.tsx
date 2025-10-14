interface LoadingSpinnerProps {
    text?: string;
    fullScreen?: boolean;
  }
  
  export default function LoadingSpinner({ 
    text = 'MIRROR', 
    fullScreen = true 
  }: LoadingSpinnerProps) {
    return (
      <div className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen bg-neutral-900' : 'py-20'
      }`}>
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-4">
            {text.split('').map((letter, index) => (
              <span
                key={index}
                className="text-7xl font-bold text-[#D26900] animate-bounce-wave"
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          
       
        </div>
      </div>
    );
  }