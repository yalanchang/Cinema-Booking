// app/privacy/page.tsx

export default function PrivacyPage() {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">隱私權政策</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">資料收集</h2>
            <p className="text-gray-300">
              MIRROR Cinema 僅收集您的姓名、電子郵件地址和電話號碼，
              用於會員管理和訂票服務。
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">資料使用</h2>
            <p className="text-gray-300">
              我們使用您的個人資料來處理訂票、發送訂單確認，
              以及提供客戶支援服務。
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">資料保護</h2>
            <p className="text-gray-300">
              我們採用業界標準的安全措施來保護您的個人資料。
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">聯絡我們</h2>
            <p className="text-gray-300">
              如有任何問題，請聯繫：support@mirror-cinema.com
            </p>
          </section>
        </div>
      </div>
    );
  }