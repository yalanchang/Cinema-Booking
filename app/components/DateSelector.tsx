interface DateSelectorProps {
    availableDates: string[];
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    formatDate: (dateString: string) => string;
    isToday: (dateString: string) => boolean;
  }
  
  export default function DateSelector({
    availableDates,
    selectedDate,
    setSelectedDate,
    formatDate,
    isToday,
  }: DateSelectorProps) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">選擇日期</h2>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-all cursor-pointer ${selectedDate === date
                ? 'bg-primary text-white'
                : 'bg-neutral-800 text-gray-300 hover:bg-neutral-900'
                }`}
            >
              {formatDate(date)}
              {isToday(date) && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  今天
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }