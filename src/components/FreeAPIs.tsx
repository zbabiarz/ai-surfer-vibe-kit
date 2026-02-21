import { useState } from 'react';
import { ChevronDown, Database, ExternalLink, X } from 'lucide-react';

export function FreeAPIs() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState<any>(null);

  const apis = [
    {
      name: 'Data.gov API',
      description: 'Access thousands of government datasets and APIs',
      signupUrl: 'https://api.data.gov/signup/',
      features: [
        'Access to 200,000+ datasets',
        'Government data from various agencies',
        'Free API key with registration',
        'RESTful API endpoints',
        'Data on topics like health, education, climate, and more'
      ],
      documentation: 'https://api.data.gov/docs/',
      rateLimit: 'Demo key: 30 requests per IP per hour. Registered key: 1,000 requests per hour'
    },
    {
      name: 'PublicAPIs.io',
      description: 'Discover thousands of free public APIs across various categories',
      signupUrl: 'https://publicapis.io/',
      features: [
        'Browse 1000+ free public APIs',
        'Categories include Weather, Finance, Gaming, Sports, and more',
        'No API key required for most listings',
        'Detailed API documentation links',
        'Regularly updated with new APIs'
      ],
      documentation: 'https://publicapis.io/',
      rateLimit: 'Varies by API - check individual API documentation'
    }
  ];

  const handleAPISelect = (api: any) => {
    setSelectedAPI(api);
    setShowAPIModal(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-colors border border-gray-200 dark:border-gray-600 whitespace-nowrap"
        >
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">Free APIs</span>
          <span className="sm:hidden">APIs</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {apis.map((api, index) => (
                <button
                  key={index}
                  onClick={() => handleAPISelect(api)}
                  className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {api.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAPIModal && selectedAPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-[60] p-4 pt-24">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {selectedAPI.name}
              </h3>
              <button
                onClick={() => setShowAPIModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {selectedAPI.description}
              </p>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Features:</h4>
                <ul className="space-y-2">
                  {selectedAPI.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Rate Limit:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {selectedAPI.rateLimit}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={selectedAPI.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-400 dark:bg-brand-400 text-white rounded-lg hover:bg-brand-500 dark:hover:bg-brand-200 transition-colors"
                >
                  Sign Up for API Key
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={selectedAPI.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  View Documentation
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex gap-4 justify-end p-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowAPIModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}
