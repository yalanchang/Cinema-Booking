export default function TermsPage() {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">服務條款</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">服務說明</h2>
            <p className="text-gray-300">
              MIRROR Cinema 提供線上電影訂票服務。
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">使用者責任</h2>
            <p className="text-gray-300">
              使用者應提供正確的個人資料，並妥善保管帳號密碼。
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">退票政策</h2>
            <p className="text-gray-300">
              訂票後如需退票，請於放映前 24 小時聯繫客服。
            </p>
          </section>
        </div>
      </div>
    );
  }