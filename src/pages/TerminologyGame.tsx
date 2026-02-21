import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Term {
  name: string;
  definition: string;
  explanation: string;
}

interface Category {
  title: string;
  icon: string;
  terms: Term[];
}

interface GameScore {
  id: string;
  score: number;
  total_questions: number;
  created_at: string;
}

const categories: Category[] = [
  {
    title: 'Core Tech & Web Basics',
    icon: '⚙️',
    terms: [
      {
        name: 'API',
        definition: 'A way for two different programs to talk and share information with each other.',
        explanation: 'Imagine you\'re at a restaurant. You (the app) tell the waiter (the API) what food you want. The waiter goes to the kitchen (the server), gets it, and brings it back. You don\'t need to know how the food is made — you just order and get what you asked for.'
      },
      {
        name: 'Server',
        definition: 'A computer that stores, processes, and delivers data to other computers over the internet.',
        explanation: 'Think of it like a giant kitchen that cooks and serves food to all the hungry computers around the world. When you open a website, your device is like a customer placing an order, and the server is the chef preparing and delivering it.'
      },
      {
        name: 'Client',
        definition: 'The device or program that asks a server for information.',
        explanation: 'When you visit a website on your phone or laptop, your device is the "customer" placing an order. It sends a request to the "server kitchen," and the server sends back the meal — the web page you see.'
      },
      {
        name: 'Database',
        definition: 'A system that stores and organizes data so it can be found and used quickly.',
        explanation: 'Imagine a giant toy box with perfectly labeled bins — one for cars, one for dolls, one for blocks. A database keeps all the toys (data) sorted so you can find exactly what you need in seconds.'
      },
      {
        name: 'Hosting',
        definition: 'A service that stores your website and makes it available to people online.',
        explanation: 'It\'s like renting space on the internet for your website to live. If your site were a house, hosting would be the land it\'s built on — it keeps the lights on so people can visit anytime.'
      },
      {
        name: 'Domain',
        definition: 'The unique name of a website that people type to find it online.',
        explanation: 'Your domain is your house address on the internet. Just like "123 Main Street" tells people where you live, "effortlessaiautomation.com" tells browsers where your site lives.'
      },
      {
        name: 'DNS',
        definition: 'A system that connects a domain name to the actual IP address of the server.',
        explanation: 'Think of it like your phone\'s contact list. You don\'t remember your friend\'s number — you just tap their name. DNS does the same thing for websites — it remembers the numbers (IP addresses) so you don\'t have to.'
      },
      {
        name: 'IP Address',
        definition: 'A unique string of numbers that identifies a device or server on the internet.',
        explanation: 'Every computer has its own secret "home address" made of numbers. That\'s how other computers know exactly where to send the messages or websites you ask for.'
      },
      {
        name: 'Backend',
        definition: 'The part of a website or app that works behind the scenes — handling logic, databases, and requests.',
        explanation: 'It\'s the kitchen in a restaurant. You don\'t see what\'s happening, but that\'s where the real cooking gets done. The backend makes everything work properly before it\'s served to the user.'
      },
      {
        name: 'Frontend',
        definition: 'The part of a website or app that users see and interact with.',
        explanation: 'This is the dining area of the restaurant — the chairs, tables, and menus. It\'s the visible, interactive space where people enjoy the final product that the backend cooked up.'
      },
      {
        name: 'Full Stack',
        definition: 'Someone or something that works with both the frontend and backend.',
        explanation: 'It\'s like being both the chef and the waiter. A full-stack developer knows how to cook the food (backend) and serve it beautifully to customers (frontend).'
      },
      {
        name: 'Framework',
        definition: 'A pre-made structure or template that helps you build software faster.',
        explanation: 'Think of it like a Lego baseplate or a house skeleton. It gives you the strong starting shape so you can focus on adding the fun and creative details instead of building everything from scratch.'
      },
      {
        name: 'Library',
        definition: 'A collection of pre-written code that developers can use to save time.',
        explanation: 'It\'s like a shelf full of Lego pieces or tools you can grab anytime you need them. Instead of building a door from scratch, you just pull one off the shelf and snap it in.'
      },
      {
        name: 'Component',
        definition: 'A small, reusable piece of an app or website.',
        explanation: 'Like a Lego block or puzzle piece that fits into different projects. You can use the same button, menu, or card design across multiple pages without rebuilding it every time.'
      },
      {
        name: 'Function',
        definition: 'A block of code that performs a specific task.',
        explanation: 'Think of it like a magic spell you can cast anytime you want. When you say the word ("bakeCake()"), the computer instantly does that job — no need to explain all the steps again.'
      },
      {
        name: 'Variable',
        definition: 'A container that holds information that can change.',
        explanation: 'Like a jar with a label that says "cookies." You can fill it, empty it, or put something new in it later — but the label always helps you remember what\'s inside.'
      },
      {
        name: 'Algorithm',
        definition: 'A step-by-step set of rules for solving a problem or completing a task.',
        explanation: 'Like a recipe for chocolate chip cookies — it tells you exactly what steps to follow and in what order so you always get the same tasty result.'
      },
      {
        name: 'Logic',
        definition: 'The reasoning or rules that tell software what to do.',
        explanation: 'Imagine a robot helper. You tell it, "If it\'s raining, grab my umbrella. If it\'s sunny, grab my sunglasses." That\'s logic — simple rules that guide decisions.'
      },
      {
        name: 'Automation',
        definition: 'Using software to do tasks automatically without human effort.',
        explanation: 'Think of a helpful robot that waters your plants every morning. You don\'t have to remind it — it just knows what to do and does it perfectly every time.'
      }
    ]
  },
  {
    title: 'Website & UI/UX',
    icon: '💻',
    terms: [
      {
        name: 'Landing Page',
        definition: 'A single web page made to get visitors to take one specific action.',
        explanation: 'Think of it like a lemonade stand sign that says, "Try our lemonade!" It\'s clear, bright, and made to get people to stop and take a sip — not to wander around a whole store.'
      },
      {
        name: 'UI (User Interface)',
        definition: 'The visual parts of a website or app that people see and touch.',
        explanation: 'Imagine the buttons, colors, and menus like the decorations and furniture in your house. A good UI makes people feel comfy and want to stay.'
      },
      {
        name: 'UX (User Experience)',
        definition: 'How easy and enjoyable it feels to use a website or app.',
        explanation: 'UX is like a playground. If the swings work smoothly and the slides aren\'t too steep, everyone has fun. But if things are confusing or broken, people stop playing.'
      },
      {
        name: 'CTA (Call to Action)',
        definition: 'A button or message that asks users to do something (like "Buy Now").',
        explanation: 'It\'s the "big red button" that says, "Press me to win!" It tells people exactly what to do next so they don\'t get lost.'
      },
      {
        name: 'Form',
        definition: 'A set of boxes where people can type or choose answers to share info.',
        explanation: 'Like filling out a birthday invitation — you write your name, age, and favorite color so your friend knows what you like.'
      },
      {
        name: 'Responsive Design',
        definition: 'Design that automatically adjusts to any screen size.',
        explanation: 'It\'s like stretchy pants — they fit perfectly no matter if you\'re small or tall. A responsive site looks great on phones, tablets, and computers.'
      },
      {
        name: 'CSS',
        definition: 'Code that controls how a webpage looks — colors, fonts, spacing, and layout.',
        explanation: 'Think of it as the paint and wallpaper that make your house pretty. The walls are HTML, but CSS adds the sparkle.'
      },
      {
        name: 'HTML',
        definition: 'The basic structure or skeleton of every web page.',
        explanation: 'HTML is like the bricks and beams of a building — it gives shape and structure before you add paint or furniture.'
      },
      {
        name: 'JavaScript',
        definition: 'The programming language that makes websites interactive.',
        explanation: 'It\'s the electricity that makes things come alive — turning lights on, opening doors, or showing hidden surprises when you click.'
      }
    ]
  },
  {
    title: 'Accounts & Data',
    icon: '🔐',
    terms: [
      {
        name: 'Authentication',
        definition: 'The process of checking who you are when logging in.',
        explanation: 'Like showing your school ID to the teacher — it proves you\'re really part of the class.'
      },
      {
        name: 'Authorization',
        definition: 'The rules that decide what you can do once you\'re logged in.',
        explanation: 'After you get into the school, authorization decides which rooms you can go in — maybe you can visit the art room, but not the teacher\'s lounge.'
      },
      {
        name: 'OAuth',
        definition: 'A way to log into one app using another account, like Google or Apple.',
        explanation: 'It\'s like borrowing a key from your friend instead of making a new one. You use your Google "key" to open a new door without needing a new password.'
      },
      {
        name: 'Session / Token',
        definition: 'A temporary pass that keeps you logged in while you use an app.',
        explanation: 'Think of it like a visitor badge. While you wear it, you can walk around. When you leave, it expires, keeping things safe.'
      },
      {
        name: 'Encryption',
        definition: 'Turning data into secret code so only the right person can read it.',
        explanation: 'Like writing a secret note to your best friend in a special alphabet that only the two of you understand.'
      },
      {
        name: 'Cookie',
        definition: 'A small piece of data a website saves on your computer to remember you.',
        explanation: 'Imagine a little note the website leaves in your lunchbox saying, "Hey, it\'s you again!" so it remembers your name or preferences next time.'
      }
    ]
  },
  {
    title: 'Business & App Integration',
    icon: '💰',
    terms: [
      {
        name: 'Payment Processing',
        definition: 'The system that handles buying and selling online securely.',
        explanation: 'Like a cashier at a store who safely takes your money, gives you change, and makes sure everything adds up perfectly.'
      },
      {
        name: 'Webhook',
        definition: 'A tool that automatically sends data from one app to another when something happens.',
        explanation: 'Like when a doorbell rings and your dog runs to the door — the ring (event) triggers an automatic action.'
      },
      {
        name: 'Integration',
        definition: 'Connecting two or more apps so they share data or work together.',
        explanation: 'Like building a bridge between two islands so people can easily travel back and forth.'
      },
      {
        name: 'CRM',
        definition: 'Software that helps businesses track customers and conversations.',
        explanation: 'Think of it like a friendship journal — it keeps notes on who you talked to, what you said, and what they like, so you can always be thoughtful next time.'
      },
      {
        name: 'Funnel',
        definition: 'The path people take from learning about your product to buying it.',
        explanation: 'Like a slide at the playground — it guides people smoothly from the top (curious) to the bottom (happy customer).'
      },
      {
        name: 'SEO',
        definition: 'Techniques to make websites show up higher in Google searches.',
        explanation: 'Like putting up a bright neon sign so people can find your lemonade stand first before anyone else\'s.'
      },
      {
        name: 'Backlink',
        definition: 'A link from another website that points to yours.',
        explanation: 'Imagine a friend telling others, "Hey, go check out Zach\'s stand — it\'s awesome!" The more people recommend you, the more popular you become online.'
      },
      {
        name: 'Conversion',
        definition: 'When someone takes the action you wanted — like signing up or buying.',
        explanation: 'Like when someone tastes your lemonade and says, "I\'ll take a cup!" That\'s a win.'
      },
      {
        name: 'Analytics',
        definition: 'Data that tracks what users do on your website or app.',
        explanation: 'Like counting how many people visit your stand, how many buy something, and what time they show up — it helps you improve your game.'
      },
      {
        name: 'A/B Testing',
        definition: 'Comparing two versions of something to see which works better.',
        explanation: 'Like giving out two lemonade flavors — one pink, one yellow — and seeing which kids like more so you can make that one next time.'
      }
    ]
  },
  {
    title: 'AI & Automation',
    icon: '🧠',
    terms: [
      {
        name: 'Prompt',
        definition: 'The text or question you give an AI to tell it what to do.',
        explanation: 'It\'s like giving your robot friend clear instructions — "Draw a cat wearing sunglasses." The better you explain it, the cooler the result.'
      },
      {
        name: 'Model',
        definition: 'The brain of an AI that learns patterns and gives answers.',
        explanation: 'Like a super-smart friend who\'s read every book ever — it remembers patterns so it can guess what you mean and respond intelligently.'
      },
      {
        name: 'Training Data',
        definition: 'The information an AI learns from to get smarter.',
        explanation: 'Like studying your homework notes before a test — the more examples you see, the better you get at answering new questions.'
      },
      {
        name: 'Fine-Tuning',
        definition: 'Teaching an AI new, specific examples to make it smarter for one task.',
        explanation: 'If the AI already knows how to draw animals, fine-tuning teaches it how to draw just dogs wearing hats.'
      },
      {
        name: 'Agent',
        definition: 'An AI that can take actions on its own to reach a goal.',
        explanation: 'Like a smart assistant who doesn\'t just answer questions — it books the appointment, sends the email, and makes things happen automatically.'
      },
      {
        name: 'Workflow',
        definition: 'A series of steps that happen automatically to finish a task.',
        explanation: 'Think of a Rube Goldberg machine — one action triggers the next until the whole job\'s done perfectly without you lifting a finger.'
      },
      {
        name: 'Trigger',
        definition: 'The event that starts a workflow.',
        explanation: 'Like pressing the "start" button on a toy car track — once it\'s pressed, the race begins.'
      },
      {
        name: 'Condition',
        definition: 'A rule that decides what happens next.',
        explanation: 'Like saying, "If it\'s sunny, wear shorts. If it\'s raining, wear a raincoat." The app follows the same kind of rules.'
      },
      {
        name: 'NLP',
        definition: 'The part of AI that helps computers understand human language.',
        explanation: 'It\'s how AI learns to talk like us — turning our words into meaning, so it knows that "What\'s up?" isn\'t about the sky.'
      },
      {
        name: 'Knowledge Base',
        definition: 'A collection of facts or documents an AI uses for answers.',
        explanation: 'Like a big notebook full of everything your teacher has ever taught — when you need to explain something, you flip to the right page.'
      },
      {
        name: 'LLM',
        definition: 'A type of AI trained on massive amounts of text to generate human-like responses.',
        explanation: 'Like a super chatty brain that read millions of books and now can talk, write, and think just like a person.'
      }
    ]
  },
  {
    title: 'Tools & Platforms',
    icon: '🧰',
    terms: [
      {
        name: 'No-Code',
        definition: 'Platforms that let you build apps without writing code.',
        explanation: 'Like using building blocks instead of wood and nails — you can still make amazing creations without needing to hammer anything.'
      },
      {
        name: 'Low-Code',
        definition: 'Building with mostly drag-and-drop tools, plus a little real code.',
        explanation: 'Like baking a cake mix — most ingredients are ready, but you add a few extras to make it perfect.'
      }
    ]
  }
];

export default function TerminologyGame() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Array<{
    term: Term;
    options: string[];
  }>>([]);
  const [gameHistory, setGameHistory] = useState<GameScore[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const allTerms = categories.flatMap(cat => cat.terms);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await loadGameHistory(user.id);
      }
      setIsLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadGameHistory(session.user.id);
        } else {
          setGameHistory([]);
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadGameHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading game history:', error);
      toast.error('Failed to load game history');
    } else {
      setGameHistory(data || []);
    }
  };

  const saveScore = async (finalScore: number, totalQuestions: number) => {
    if (!user) {
      toast.error('Please sign in to save your score');
      return;
    }

    const { error } = await supabase
      .from('game_scores')
      .insert({
        user_id: user.id,
        score: finalScore,
        total_questions: totalQuestions
      });

    if (error) {
      console.error('Error saving score:', error);
      toast.error('Failed to save score');
    } else {
      toast.success('Score saved!');
      await loadGameHistory(user.id);
    }
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    terms: category.terms.filter(term =>
      term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.explanation.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.terms.length > 0);

  const startGame = () => {
    const shuffled = [...allTerms].sort(() => Math.random() - 0.5).slice(0, 10);
    const questions = shuffled.map(term => {
      const wrongAnswers = allTerms
        .filter(t => t.name !== term.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(t => t.name);
      const options = [...wrongAnswers, term.name].sort(() => Math.random() - 0.5);
      return { term, options };
    });
    setGameQuestions(questions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsGameActive(true);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === gameQuestions[currentQuestion].term.name) {
      setScore(score + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      await saveScore(score, gameQuestions.length);
      setIsGameActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="bg-gradient-to-r from-brand-400 to-brand-600 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="text-5xl font-extrabold uppercase mb-4 drop-shadow-lg">Vibe Coder Glossary</h1>
          <p className="text-2xl mb-2 opacity-95 font-medium">Tech words explained simply!</p>
          <p className="text-lg italic opacity-90">Because everyone starts somewhere... and that's awesome!</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {user && gameHistory.length > 0 && (
          <div className="bg-gradient-to-r from-brand-50 to-neutral-light dark:from-gray-800 dark:to-gray-750 border-2 border-brand-400 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Game History</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Games Played: <span className="text-brand-400 dark:text-brand-300">{gameHistory.length}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Best Score: <span className="text-green-600 dark:text-green-400">
                  {Math.max(...gameHistory.map(g => Math.round((g.score / g.total_questions) * 100)))}%
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {gameHistory.slice(0, 10).map((game, index) => {
                const percentage = Math.round((game.score / game.total_questions) * 100);
                const bgColor = percentage === 100 ? 'bg-green-100 dark:bg-green-900/30 border-green-500' :
                               percentage >= 70 ? 'bg-brand-100 dark:bg-brand-400/20 border-brand-400' :
                               'bg-orange-100 dark:bg-orange-900/30 border-orange-500';
                return (
                  <div key={game.id} className={`${bgColor} border-2 rounded-xl p-3 text-center`}>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Game {gameHistory.length - index}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{game.score}/{game.total_questions}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-brand-50 dark:bg-brand-400/10 border-2 border-brand-200 dark:border-brand-400/30 rounded-2xl p-6 mb-8">
            <p className="text-center text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Sign in to track your game scores and compete with yourself!</span>
            </p>
          </div>
        )}

        <button
          onClick={() => isGameActive ? setIsGameActive(false) : startGame()}
          className="bg-brand-400 hover:bg-brand-500 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 mb-8"
        >
          {isGameActive ? 'Back to Glossary' : 'Play the Matching Game!'}
        </button>

        {isGameActive && gameQuestions.length > 0 ? (
          <div className="bg-gradient-to-br from-brand-50 to-neutral-light dark:from-gray-800 dark:to-gray-700 border-4 border-brand-400 dark:border-brand-300 rounded-3xl p-10 mb-12">
            {currentQuestion < gameQuestions.length ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold uppercase text-brand-400 dark:text-brand-300 mb-3">Match the Definition!</h2>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Score: <span className="text-brand-400 dark:text-brand-300">{score}</span> / {gameQuestions.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Question {currentQuestion + 1} of {gameQuestions.length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg mb-6">
                  <p className="text-xl text-gray-800 dark:text-gray-100 leading-relaxed mb-6 font-medium">
                    {gameQuestions[currentQuestion].term.definition}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameQuestions[currentQuestion].options.map((option) => {
                      const isCorrect = option === gameQuestions[currentQuestion].term.name;
                      const isSelected = option === selectedAnswer;

                      let className = "bg-white dark:bg-gray-800 border-4 border-gray-300 dark:border-gray-600 p-5 rounded-xl cursor-pointer transition-all text-center text-lg font-semibold text-gray-800 dark:text-gray-100 hover:border-brand-400 hover:-translate-y-1 hover:shadow-lg";

                      if (showFeedback) {
                        if (isCorrect) {
                          className = "bg-green-400 border-4 border-green-600 text-white p-5 rounded-xl text-center text-lg font-semibold shadow-lg";
                        } else if (isSelected) {
                          className = "bg-red-400 border-4 border-red-600 text-white p-5 rounded-xl text-center text-lg font-semibold";
                        } else {
                          className += " opacity-60 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => !showFeedback && handleAnswer(option)}
                          disabled={showFeedback}
                          className={className}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {showFeedback && (
                  <>
                    <div className={`text-center text-xl font-bold py-4 px-6 rounded-xl mb-4 ${
                      selectedAnswer === gameQuestions[currentQuestion].term.name
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {selectedAnswer === gameQuestions[currentQuestion].term.name
                        ? 'Correct! Great job!'
                        : `Not quite! The answer was "${gameQuestions[currentQuestion].term.name}"`}
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl mb-6">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {gameQuestions[currentQuestion].term.explanation}
                      </p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={nextQuestion}
                        className="bg-brand-400 hover:bg-brand-500 text-white font-bold text-lg px-10 py-3 rounded-full transition-all transform hover:scale-105"
                      >
                        {currentQuestion < gameQuestions.length - 1 ? 'Next Question' : 'See Results'}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-4xl font-extrabold uppercase text-brand-400 dark:text-brand-300 mb-6">Game Complete!</h3>
                <p className="text-2xl text-gray-800 dark:text-gray-200 mb-4">
                  Your Score: <span className="font-bold text-brand-400 dark:text-brand-300">{score}</span> out of {gameQuestions.length}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {score === gameQuestions.length ? 'Perfect score! You\'re a tech terminology master!' :
                   score >= gameQuestions.length * 0.7 ? 'Great job! Keep learning!' :
                   'Keep practicing! You\'re getting better!'}
                </p>
                <button
                  onClick={startGame}
                  className="bg-brand-400 hover:bg-brand-500 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="sticky top-5 z-50 mb-10">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a term..."
                className="w-full px-6 py-5 text-lg border-4 border-black dark:border-gray-600 rounded-full shadow-xl focus:border-brand-400 focus:shadow-2xl transition-all outline-none bg-white dark:bg-gray-800 dark:text-white"
              />
            </div>

            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.title} className="mb-16">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b-4 border-brand-400">
                    <span className="text-4xl">{category.icon}</span>
                    <h2 className="text-3xl font-bold text-black dark:text-white">{category.title}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.terms.map((term) => (
                      <div
                        key={term.name}
                        className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-brand-400 cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-brand-400 transform scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                        <h3 className="text-2xl font-bold text-black dark:text-white mb-3">{term.name}</h3>
                        <div className="bg-brand-50 dark:bg-brand-400/10 text-brand-600 dark:text-brand-300 font-semibold p-3 rounded-lg mb-4">
                          {term.definition}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {term.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-600 dark:text-gray-400 text-xl">
                No terms found matching "{searchTerm}"
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
