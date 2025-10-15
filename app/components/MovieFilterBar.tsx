// components/MovieFilterBar.tsx
'use client';

interface MovieFilterBarProps {
  selectedDate: string;
  selectedTimeSlot: string;
  filteredCount: number;
  onDateChange: (date: string) => void;
  onTimeSlotChange: (slot: string) => void;
  onClearFilters: () => void;
}

export default function MovieFilterBar({
  selectedDate,
  selectedTimeSlot,
  filteredCount,
  onDateChange,
  onTimeSlotChange,
  onClearFilters,
}: MovieFilterBarProps) {
  
  // 產生未來7天的日期選項
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dates.push(dateString);
    }

    return dates;
  };

  const formatDateDisplay = (dateString: string) => {
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const date = new Date(year, month, day);
    const days = ['日', '一', '二', '三', '四', '五', '六'];

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `今天 ${month + 1}/${day} (${days[date.getDay()]})`;
    }

    return `${month + 1}/${day} (${days[date.getDay()]})`;
  };

  const hasFilters = selectedDate || selectedTimeSlot !== 'all';

  return (
    <div className="bg-n9">
      <div className="container mx-auto p-6">
        <div className="flex w-full justify-start md:flex-row gap-20 md:items-center">

          {/* 日期 */}
          <div className="w-full md:w-[360px] relative group">
            <span className="text-sm text-white">請選擇日期</span>
            <select
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full py-4 text-white focus:outline-none border-b-1 border-transparent hover:border-[#D26900] hover:text-gray-400 transition-all duration-300 ease-in-out cursor-pointer peer"
            >
              <option value="">全部日期</option>
              {getDateOptions().map(date => (
                <option key={date} value={date}>
                  {formatDateDisplay(date)}
                </option>
              ))}
            </select>
            <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 peer-focus:w-full peer-focus:left-0 rounded-full"></span>
          </div>

          {/* 時段 */}
          <div className="w-full md:w-[360px] relative group">
            <span className="text-sm text-white">請選擇時段</span>
            <select
              value={selectedTimeSlot}
              onChange={(e) => onTimeSlotChange(e.target.value)}
              className="w-full py-4 text-white focus:outline-none border-b-1 border-transparent hover:text-gray-400 hover:border-[#D26900] transition-all duration-300 ease-in-out cursor-pointer peer"
            >
              <option value="all">全部時段</option>
              <option value="morning">早場 (10:00-12:00)</option>
              <option value="afternoon">午場 (12:00-18:00)</option>
              <option value="evening">晚場 (18:00-22:00)</option>
              <option value="night">深夜場 (22:00-02:00)</option>
            </select>
            <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 peer-focus:w-full peer-focus:left-0 rounded-full"></span>
          </div>

          {/* 清除按鈕和結果 */}
          <div className="flex items-center gap-8 ml-auto">
            {hasFilters && (
              <>
                <button
                  onClick={onClearFilters}
                  className="w-full md:w-auto px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xs transition-all font-medium whitespace-nowrap"
                >
                  清除篩選
                </button>
                <div>
                  <p className="text-gray-300 text-sm md:text-right">
                    共 <span className="text-primary font-bold">{filteredCount}</span> 部電影
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}