export default function PricingPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Pay-As-You-Go Pricing
        </h1>
        <p className="text-lg text-gray-600">
          Buy credits and use them when you need. No subscriptions.
        </p>
      </div>

      <div className="text-center max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <p className="text-5xl font-bold text-gray-900 mb-2">₹20</p>
          <p className="text-gray-600">per document</p>
        </div>

        <div className="space-y-3 text-left mb-8">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-700">Generate legal notices</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-700">Create rent agreements</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-700">AI-powered drafting</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-700">Instant download</span>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-500 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-700">Access to all past documents</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Credit packs coming soon. Start with pay-per-document for now.
        </p>

        <a href="/sign-up" className="inline-block w-full">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Get Started
          </button>
        </a>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          This is an AI-generated draft service. Always consult a qualified lawyer before using any legal document.
        </p>
      </div>
    </main>
  );
}
