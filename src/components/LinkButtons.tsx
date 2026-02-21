import { BookOpen, Palette, Gamepad2 } from 'lucide-react';

export default function LinkButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <a
        href="https://www.effortlessaiautomation.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <BookOpen className="w-5 h-5" />
        Learn More About Vibe Coder
      </a>

      <a
        href="https://www.figma.com/design/vLmN2o0dOT9O5VUlqXqxGW/Vibe-Coder-Brand-Kit?node-id=0-1&t=NZCPpJ0uMbkRYy53-1"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <Palette className="w-5 h-5" />
        View Brand Kit
      </a>

      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <Gamepad2 className="w-5 h-5" />
        Terminology Game
      </a>
    </div>
  );
}