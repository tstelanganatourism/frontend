import React from 'react';
import { UtensilsCrossed, Clock, Leaf, ShieldAlert } from 'lucide-react';

interface MealItem {
  id: number;
  meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  name: string;
  serving_time?: string | null;
  description?: string | null;
  cost_per_person: number | string;
  is_vegetarian: boolean;
  day_number?: number | null;
  sort_order: number;
}

interface PackageMealsProps {
  meals?: MealItem[];
  hasRefreshments?: boolean;
}

export function PackageMeals({ meals = [], hasRefreshments = false }: PackageMealsProps) {
  if (!meals.length && !hasRefreshments) return null;

  const mealTypesInfo = {
    BREAKFAST: { label: 'Breakfast', emoji: '🌅', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    LUNCH: { label: 'Lunch', emoji: '🍽️', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    DINNER: { label: 'Dinner', emoji: '🌙', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    SNACKS: { label: 'Snacks', emoji: '🥪', color: 'bg-orange-50 text-orange-850 border-orange-250' },
  };

  return (
    <section id="meals" className="scroll-mt-[135px] sm:scroll-mt-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <UtensilsCrossed className="h-5 w-5 text-[#0d6e75]" />
        <p className="text-xs font-black uppercase tracking-wider text-[#0d6e75]">Culinary Details</p>
      </div>
      <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Food & Meals Menu</h2>
      <p className="text-sm font-medium text-slate-500 mt-2">
        Freshly prepared traditional South Indian meals are served on-board during the Godavari river cruise.
      </p>

      {meals.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {meals.map((meal) => {
            const info = mealTypesInfo[meal.meal_type] || { label: 'Meal', emoji: '🍽️', color: 'bg-slate-50 text-slate-800 border-slate-200' };
            const cost = Number(meal.cost_per_person || 0);

            return (
              <div
                key={meal.id}
                className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top indicators */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${info.color}`}>
                      <span>{info.emoji}</span>
                      {info.label}
                      {meal.day_number && <span className="opacity-80 ml-0.5">• Day {meal.day_number}</span>}
                    </span>

                    {/* Vegetarian Indicator */}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${meal.is_vegetarian ? 'text-green-650' : 'text-rose-500'}`}>
                      <Leaf className={`h-3.5 w-3.5 fill-current ${meal.is_vegetarian ? 'text-green-500' : 'text-rose-500'}`} />
                      {meal.is_vegetarian ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>

                  {/* Meal details */}
                  <h3 className="text-sm font-black text-slate-900 mt-4 leading-snug">
                    {meal.name}
                  </h3>

                  {meal.description && (
                    <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed bg-[#fafaf8] p-2.5 rounded-xl border border-slate-100">
                      {meal.description}
                    </p>
                  )}
                </div>

                {/* Serving & Cost footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap text-xs">
                  {meal.serving_time ? (
                    <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {meal.serving_time}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold italic">Flexible timing</span>
                  )}

                  <span className="font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
                    ✓ Served On-Board
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className="rounded-xl bg-teal-500/5 p-2.5 text-[#0d6e75]">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Fresh food served on-board</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-500 mt-1">
              Standard local breakfast and lunch meals are prepared fresh and served on the boat during the tour. Specify food options upon check-in.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
