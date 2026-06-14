import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
  learnerId: string | null;
}

export function WarChestDashboard({ onNavigate, learnerId }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-stone-950 text-stone-200 gap-4">
      <h1 className="text-3xl font-bold text-amber-400">⚔️ The War Chest</h1>
      <p className="text-stone-400">
        {learnerId ? `Welcome, ${learnerId}` : 'Academy Mode not active'}
      </p>
      <p className="text-stone-500 text-sm">Learner dashboard — coming in Week 5</p>
      <button
        onClick={() => onNavigate(Screen.MAIN_MENU)}
        className="mt-4 px-6 py-2 border border-stone-600 rounded text-stone-300 hover:bg-stone-800 transition"
      >
        Return to Main Menu
      </button>
    </div>
  );
}