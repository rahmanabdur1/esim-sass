'use client';
import React, {  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Globe, Users, ShoppingBag,
  Lock, CheckCircle, Sparkles,
} from 'lucide-react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cn } from '@/utils';

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================

export interface Achievement {
  id:          string;
  title:       string;
  description: string;
  icon:        React.ElementType;
  tier:        'bronze' | 'silver' | 'gold' | 'platinum';
  points:      number;
  condition:   (stats: UserStats) => boolean;
}

export interface UserStats {
  totalPurchases:     number;
  totalCountries:     number;
  totalReferrals:     number;
  accountAgeMonths:   number;
  consecutiveMonths:  number;
  totalSpent:         number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-purchase', title: 'First Steps', description: 'Complete your first eSIM purchase',
    icon: ShoppingBag, tier: 'bronze', points: 50,
    condition: (s) => s.totalPurchases >= 1,
  },
  {
    id: 'explorer-3', title: 'Explorer', description: 'Buy plans for 3 different countries',
    icon: Globe, tier: 'bronze', points: 100,
    condition: (s) => s.totalCountries >= 3,
  },
  {
    id: 'globe-trotter', title: 'Globe Trotter', description: 'Buy plans for 10 different countries',
    icon: Globe, tier: 'gold', points: 500,
    condition: (s) => s.totalCountries >= 10,
  },
  {
    id: 'frequent-traveler', title: 'Frequent Traveler', description: 'Make 5 purchases',
    icon: Zap, tier: 'silver', points: 200,
    condition: (s) => s.totalPurchases >= 5,
  },
  {
    id: 'power-user', title: 'Power User', description: 'Make 20 purchases',
    icon: Star, tier: 'platinum', points: 1000,
    condition: (s) => s.totalPurchases >= 20,
  },
  {
    id: 'referral-starter', title: 'Spreading the Word', description: 'Refer your first friend',
    icon: Users, tier: 'bronze', points: 75,
    condition: (s) => s.totalReferrals >= 1,
  },
  {
    id: 'referral-milestone', title: 'Community Builder', description: 'Refer 5 friends',
    icon: Users, tier: 'gold', points: 400,
    condition: (s) => s.totalReferrals >= 5,
  },
  {
    id: 'loyal-member', title: 'Loyal Member', description: 'Active member for 6 months',
    icon: Trophy, tier: 'silver', points: 150,
    condition: (s) => s.accountAgeMonths >= 6,
  },
  {
    id: 'big-spender', title: 'Big Spender', description: 'Spend over $200 total',
    icon: Sparkles, tier: 'gold', points: 300,
    condition: (s) => s.totalSpent >= 200,
  },
];

const TIER_STYLES: Record<Achievement['tier'], { bg: string; text: string; ring: string; label: string }> = {
  bronze:   { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300', label: 'Bronze'   },
  silver:   { bg: 'bg-slate-100',  text: 'text-slate-700',  ring: 'ring-slate-300',  label: 'Silver'   },
  gold:     { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-400', label: 'Gold'     },
  platinum: { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-400', label: 'Platinum' },
};

// ============================================================
// STORE — tracks unlocked achievements + triggers toast
// ============================================================

interface AchievementStore {
  unlocked:       string[];
  newlyUnlocked:  string | null;
  checkAndUnlock: (stats: UserStats) => void;
  dismissToast:   () => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked:      [],
      newlyUnlocked: null,
      checkAndUnlock: (stats) => {
        const { unlocked } = get();
        for (const ach of ACHIEVEMENTS) {
          if (!unlocked.includes(ach.id) && ach.condition(stats)) {
            set({ unlocked: [...unlocked, ach.id], newlyUnlocked: ach.id });
            break; // unlock one at a time so toasts don't stack
          }
        }
      },
      dismissToast: () => set({ newlyUnlocked: null }),
    }),
    { name: 'achievements', storage: createJSONStorage(() => localStorage) }
  )
);

// ============================================================
// ACHIEVEMENT GRID — full display
// ============================================================

export function AchievementGrid({ stats }: { stats: UserStats }) {
  const { unlocked } = useAchievementStore();
  const totalPoints  = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).reduce((s, a) => s + a.points, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" aria-hidden="true" /> Achievements
        </h2>
        <span className="text-sm text-muted-foreground">
          {unlocked.length}/{ACHIEVEMENTS.length} unlocked · <strong className="text-foreground">{totalPoints}</strong> pts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="list" aria-label="Achievement badges">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          const style       = TIER_STYLES[ach.tier];
          const Icon         = ach.icon;

          return (
            <div
              key={ach.id}
              role="listitem"
              className={cn(
                'relative flex flex-col items-center text-center rounded-xl border p-4 transition-all',
                isUnlocked ? `${style.bg} ring-1 ${style.ring}` : 'bg-muted/30 opacity-60'
              )}
              aria-label={`${ach.title}: ${isUnlocked ? 'Unlocked' : 'Locked'}. ${ach.description}`}
            >
              {isUnlocked && (
                <CheckCircle className="absolute top-2 right-2 h-3.5 w-3.5 text-green-600" aria-hidden="true" />
              )}
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full mb-2',
                isUnlocked ? style.bg : 'bg-muted'
              )}>
                {isUnlocked
                  ? <Icon className={cn('h-6 w-6', style.text)} aria-hidden="true" />
                  : <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
              </div>
              <p className="text-xs font-semibold mb-0.5">{ach.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mb-1.5">{ach.description}</p>
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', isUnlocked ? `${style.bg} ${style.text}` : 'bg-muted text-muted-foreground')}>
                {style.label} · {ach.points}pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// UNLOCK TOAST — celebratory animation
// ============================================================

export function AchievementUnlockToast() {
  const { newlyUnlocked, dismissToast } = useAchievementStore();
  const achievement = ACHIEVEMENTS.find((a) => a.id === newlyUnlocked);

  if (!achievement) return null;
  const style = TIER_STYLES[achievement.tier];
  const Icon   = achievement.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  scale: 1   }}
        exit={{   opacity: 0, y: 40, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        role="status"
        aria-live="assertive"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border bg-card shadow-2xl p-5 w-80"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
            className={cn('flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full', style.bg)}
          >
            <Icon className={cn('h-7 w-7', style.text)} aria-hidden="true" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-yellow-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Achievement Unlocked!
            </p>
            <p className="font-semibold text-sm">{achievement.title}</p>
            <p className="text-xs text-muted-foreground">+{achievement.points} points</p>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
