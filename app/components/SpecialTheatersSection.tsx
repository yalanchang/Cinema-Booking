// components/SpecialTheatersSection.tsx
export default function SpecialTheatersSection() {
    const theaters = [
      {
        id: 1,
        name: 'IMAX',
        description: '超大銀幕，極致震撼視聽體驗',
        features: ['4K 雷射投影', '12聲道音響', '超大銀幕'],
        gradient: 'from-blue-600 to-blue-800'
      },
      {
        id: 2,
        name: '杜比全景聲',
        description: '360度環繞音效，身歷其境',
        features: ['64個喇叭', '天花板音效', '杜比視界'],
        gradient: 'from-purple-600 to-purple-800'
      },
      {
        id: 3,
        name: '4DX',
        description: '動感座椅，五感體驗',
        features: ['動感座椅', '環境特效', '水霧噴射'],
        gradient: 'from-red-600 to-red-800'
      },
    ];
  
    return (
      <section className="bg-n9 py-16 mt-10">
        <div className="container mx-auto px-6 border-t border-n7">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2 mt-16">特殊廳介紹</h2>
            <p className="text-gray-400">多種影廳選擇，打造專屬觀影體驗</p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <div
                key={theater.id}
                className="group relative bg-neutral-900 overflow-hidden
                  border border-gray-800
                  hover:border-[#D26900]
                  transition-all duration-300
                  hover:shadow-[0_0_30px_rgba(210,105,0,0.1)]">
                
                {/* 漸變背景 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theater.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
  
                <div className="relative p-8">
                
                  {/* 標題 */}
                  <h3 className="text-2xl font-bold text-white mb-2
                    group-hover:text-[#D26900]
                    transition-colors duration-300">
                    {theater.name}
                  </h3>
  
                  {/* 描述 */}
                  <p className="text-gray-400 mb-6">
                    {theater.description}
                  </p>
  
                  {/* 特色列表 */}
                  <ul className="space-y-2 mb-6">
                    {theater.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-[#D26900]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
  
                  {/* 了解更多按鈕 */}
                  <button className="w-full border border-gray-700 hover:border-[#D26900]
                    text-gray-400 hover:text-[#D26900]
                    py-2  text-sm font-medium
                    transition-all duration-300">
                    了解更多
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }