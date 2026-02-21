import { useState } from 'react';
import { ChevronDown, FileText, X } from 'lucide-react';

interface PreMadePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PreMadePrompts({ onSelectPrompt }: PreMadePromptsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const prompts = [
    {
      name: 'Link Tree look-alike',
      content: `Create a one-page mobile-optimized website styled like a modern Linktree. The color palette should be black, white, and blue—make it sleek, unique, and visually epic with smooth button animations and modern design.

**Layout & Content:**
- At the top: a circular profile photo. [Enter Photo Web Link Here]
- Below the photo: the name [Enter Your Name Here] in a bold, modern font.
- Below the name have a sub text smaller font that says [Enter Title Here]
- Below the name: a stack of clickable buttons, each linking to a different resource.

**Buttons:**
1. Button 1 Text: [Enter Button Name Here]
   Link: [Enter Your Website Address Here]
   Style: Animated hover effect, full-width rounded button

2. Button 2 Text: [Enter Button Name Here]
   Link: [Enter Your Website Address Here]
   Style: Same as above

**Design Notes:**
- Mobile-first responsive layout
- Smooth fade-in or slide-in animations for the buttons
- Bold, clean typography
- Use rounded corners and subtle drop shadows to give depth
- Make the profile image and name section visually centered and standout

No unnecessary clutter—this site should feel clean, snappy, and focused on showcasing links.`
    }
  ];

  const handlePromptSelect = (prompt: any) => {
    setSelectedPrompt(prompt.content);
    setShowPromptModal(true);
    setIsDropdownOpen(false);
  };

  const handleUsePrompt = () => {
    onSelectPrompt(selectedPrompt);
    setShowPromptModal(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-colors border border-gray-200 dark:border-gray-600 whitespace-nowrap"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Pre-made Prompts</span>
          <span className="sm:hidden">Prompts</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptSelect(prompt)}
                  className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {prompt.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-[60] p-4 pt-24">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Link Tree look-alike Prompt
              </h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm">
                This is a preview example of what this prompt can do.
              </p>
              <div className="mb-6 text-center">
                <img
                  src="https://storage.googleapis.com/msgsndr/QFjnAi2H2A9Cpxi7l0ri/media/68a7c3cc46519901f2033cc4.png"
                  alt="LinkTree Example"
                  className="mx-auto max-w-[50%] h-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                  {selectedPrompt}
                </pre>
              </div>
            </div>

            <div className="flex gap-4 justify-end p-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUsePrompt}
                className="px-4 py-2 bg-brand-400 dark:bg-brand-400 text-white rounded-lg hover:bg-brand-500 dark:hover:bg-brand-200 transition-colors"
              >
                Use This Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}
