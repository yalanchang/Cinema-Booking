import Link from 'next/link'; 

export default function MembershipSection() {
    return (
      <section className="bg-gradient-to- from-n8 to-n9 py-16 shadow-lg shadow-black/30 ">
        <div className="container mx-auto px-6 border-t border-n7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* 左側文字 */}
            <div className="flex-1 text-white pt-30 pb-10">
              <h2 className="text-4xl font-bold mb-4 ">加入會員享更多優惠</h2>
              <p className="text-lg mb-6 text-white/90">
                生日當月免費看電影、平日優惠價、點數回饋，還有更多專屬好康等著你！
              </p>
  
              <ul className="space-y-3 mb-8">
                {[
                  '生日當月贈送免費電影票',
                  '每週三會員日優惠價 180元',
                  '消費累積點數，點數可折抵票價',
                  '提前預購熱門電影票',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
  
              <div className="flex gap-4">
                <Link
                  href="/register"
                  className="bg-white text-[#D26900] px-8 py-3 
                    font-bold text-lg
                    hover:bg-gray-100
                    transition-colors duration-300
                    shadow-lg">
                  立即註冊
                </Link>
                <Link
                  href="/membership"
                  className="border border-white text-white px-8 py-3 
                    font-bold text-lg
                    hover:bg-white/10
                    transition-colors duration-300">
                  了解更多
                </Link>
              </div>
            </div>
  
            {/* 右側圖片 */}
            <div className="flex-1 flex justify-center pt-30 pb-10">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-n6/10 backdrop-blur-sm rounded-4xl
                  border-4 border-n3/30
                  flex items-center justify-center
                  transform rotate-6 hover:rotate-0
                  transition-transform duration-500">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎫</div>
                    <p className="text-white text-2xl font-bold">VIP 會員卡</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }