export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
        教室について
      </h1>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* 教室の理念 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-600">教室の理念</h2>
          <p className="text-gray-700 leading-relaxed">
            私たちのサッカー教室は、子供たちの可能性を広げることを理念としています。
            技術の向上だけでなく、チームワークや礼儀、努力する姿勢も大切にしています。
          </p>
        </section>

        {/* 指導方針 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-600">指導方針</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>基礎技術の徹底的な習得</li>
            <li>個々のレベルに合わせた指導</li>
            <li>チームワークの重要性を学ぶ</li>
            <li>楽しみながら成長できる環境づくり</li>
          </ul>
        </section>

        {/* コーチ紹介 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-600">コーチ紹介</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">山田 太郎 コーチ</h3>
            <p className="text-gray-700">
              元プロサッカー選手。指導歴10年。子供たちの成長を第一に考えた指導を行っています。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
