import { useState } from 'react';
import { Code, X } from 'lucide-react';

interface IDEListProps {
  buttonClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
}

export function IDEList({ buttonClassName, iconClassName, labelClassName }: IDEListProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const downloadableIDEs = [
    { name: 'Cursor', url: 'https://www.cursor.com' },
    { name: 'Windsurf', url: 'https://codeium.com/windsurf' },
    { name: 'Claude Code', url: 'https://claude.ai/code' },
    { name: 'Codex (OpenAI)', url: 'https://platform.openai.com' },
    { name: 'Roo Code', url: 'https://roocode.com' },
  ];

  const webBasedIDEs = [
    { name: 'Tempolabs.new', url: 'https://tempolabs.new' },
    { name: 'Bolt.new', url: 'https://bolt.new/?rid=l3uyub' },
    { name: 'Replit', url: 'https://replit.com' },
    { name: 'Lovable', url: 'https://lovable.dev' },
    { name: 'GenSpark', url: 'https://genspark.ai' },
    { name: 'Rork', url: 'https://rork.com' },
    { name: 'Pythagora', url: 'https://pythagora.ai' },
    { name: 'Draftbit', url: 'https://draftbit.com' },
    { name: 'Flutterflow', url: 'https://flutterflow.io' },
    { name: 'Emergent', url: 'https://emergent.dev' },
    { name: 'Base44', url: 'https://base44.io' },
    { name: 'Mgx.dev', url: 'https://mgx.dev' },
    { name: 'GitHub Spark', url: 'https://github.com/features/copilot-workspace' },
    { name: 'Google AI Studio', url: 'https://aistudio.google.com' },
    { name: 'Orchids', url: 'https://orchids.ai' },
    { name: 'DataButton', url: 'https://databutton.com' },
    { name: 'Flames.blue', url: 'https://flames.blue/' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClassName ?? "flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap"}
      >
        <Code className={iconClassName ?? "w-4 h-4"} />
        <span className={labelClassName}>List of IDEs</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                List of IDEs
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Downloadable IDEs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {downloadableIDEs.map((ide, index) => (
                    <a
                      key={index}
                      href={ide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-brand-200/20 dark:bg-brand-400/20 hover:bg-brand-200/40 dark:hover:bg-brand-400/40 text-brand-500 dark:text-brand-200 px-4 py-3 rounded-lg transition-all duration-200 border border-brand-200 dark:border-brand-400/50 hover:shadow-md"
                    >
                      <Code className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{ide.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Web-Based IDEs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {webBasedIDEs.map((ide, index) => (
                    <a
                      key={index}
                      href={ide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg transition-all duration-200 border border-green-200 dark:border-green-800 hover:shadow-md"
                    >
                      <Code className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{ide.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
