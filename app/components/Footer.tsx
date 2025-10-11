export default function Footer() {
    return (
      <footer className="bg-neutral-900 border-t border-gray-800 text-gray-400 ">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 ">
                     <div>
              <h3 className=" font-bold text-lg mb-4">關於我們</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="hover:text-red-400 transition-colors">
                    首頁
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-400 transition-colors">
                    熱映中
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-400 transition-colors">
                    即將上映
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-400 transition-colors">
                    優惠活動
                  </a>
                </li>
              </ul>
            </div>
              <div>
              <h3 className=" font-bold text-lg mb-4">聯絡我們</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>support@cinema.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>0800-123-456</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>台北市信義區信義路五段7號</span>
                </li>
              </ul>
            </div>
          </div>
  
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
            <p>&copy; 2025 Mirror All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-red-400 transition-colors">隱私政策</a>
              <span>•</span>
              <a href="#" className="hover:text-red-400 transition-colors">服務條款</a>
              <span>•</span>
              <a href="#" className="hover:text-red-400 transition-colors">常見問題</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }