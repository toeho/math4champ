// src/pages/Math.jsx
import { BookOpen, Brain, PenTool, Globe, FlaskConical } from "lucide-react";

// A reusable card component
function QuizCard({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-white/10 rounded-xl p-4 shadow flex flex-col gap-2">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Icon className="text-yellow-400" size={20} />
        {title}
      </div>
      <p className="text-sm text-gray-200">{description}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function Math() {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-4 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-5xl mx-auto">
        {/* Mathematics */}
        <QuizCard
          icon={BookOpen}
          title="Mathematics"
          description="Sharpen your math skills with fun quizzes!"
        >
          <div className="flex gap-2 flex-wrap">
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Algebra
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Geometry
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Numbers
            </button>
          </div>
        </QuizCard>

        {/* Science */}
        <QuizCard
          icon={FlaskConical}
          title="Science"
          description="Explore physics, chemistry and biology quizzes."
        >
          <div className="flex gap-2 flex-wrap">
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Physics
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Chemistry
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Biology
            </button>
          </div>
        </QuizCard>

        {/* English */}
        <QuizCard
          icon={PenTool}
          title="English"
          description="Test grammar, vocabulary, and comprehension."
        >
          <div className="flex gap-2 flex-wrap">
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Grammar
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Vocabulary
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Reading
            </button>
          </div>
        </QuizCard>

        {/* General Knowledge */}
        <QuizCard
          icon={Globe}
          title="General Knowledge"
          description="Boost your GK with quizzes from around the world."
        >
          <div className="flex gap-2 flex-wrap">
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              History
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Geography
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Current Affairs
            </button>
          </div>
        </QuizCard>

        {/* Mental Ability */}
        <QuizCard
          icon={Brain}
          title="Mental Ability"
          description="Challenge your logical and reasoning skills."
        >
          <div className="flex gap-2 flex-wrap">
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Puzzles
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Riddles
            </button>
            <button className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
              Patterns
            </button>
          </div>
        </QuizCard>
      </div>
    </div>
  );
}
