import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-green-50 to-white">
      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            サッカー教室へ
            <span className="text-green-600 block mt-2">ようこそ</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            子供たちの可能性を広げるサッカー教室です。
            基礎から応用まで、楽しく学べる環境を提供しています。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-lg"
            >
              ログイン
            </Link>
            <Link
              href="/about"
              className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition"
            >
              教室について
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          教室の特徴
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 特徴1 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold mb-2">基礎から応用まで</h3>
            <p className="text-gray-600">
              初心者から経験者まで、レベルに合わせた指導を行います。
            </p>
          </div>

          {/* 特徴2 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">少人数制</h3>
            <p className="text-gray-600">
              一人ひとりに目が届く少人数制で、きめ細かい指導を実現します。
            </p>
          </div>

          {/* 特徴3 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">目標達成支援</h3>
            <p className="text-gray-600">
              それぞれの目標に合わせたカリキュラムで、成長をサポートします。
            </p>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">一緒にサッカーを始めませんか？</h2>
          <p className="text-xl mb-8 text-green-100">
            無料体験レッスンも実施しています。お気軽にお問い合わせください。
          </p>
          <Link
            href="/contact"
            className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            お問い合わせ
          </Link>
        </div>
      </section>
    </div>
  )
}