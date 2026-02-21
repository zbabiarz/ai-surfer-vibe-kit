import { useState } from 'react';
import { ChevronDown, Palette, ExternalLink } from 'lucide-react';

export function DesignResources() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const resources = [
    {
      name: '21st.dev Components',
      description: 'Beautiful, modern UI components and design templates',
      url: 'https://21st.dev/community/components',
      icon: '🎨'
    },
    {
      name: 'Dribbble',
      description: 'Discover the world\'s top designers and creative professionals',
      url: 'https://dribbble.com/',
      icon: '🎯'
    },
    {
      name: 'Spline Design',
      description: '3D design tool for creating interactive web experiences',
      url: 'https://spline.design/',
      icon: '🔮'
    }
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-colors border border-gray-200 dark:border-gray-600 whitespace-nowrap"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Design/Animation</span>
          <span className="sm:hidden">Design</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 w-full text-left px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
                >
                  <span className="text-2xl">{resource.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{resource.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {resource.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}
