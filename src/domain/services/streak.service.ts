import type { GamificationState } from "../entities/gamification";
import type { DateString } from "../value-objects/date";
import { subtractDays } from "../value-objects/date";

export class StreakService {
  static updateStreak(
    state: GamificationState,
    loggedDate: DateString,
  ): GamificationState {
    const { lastLoggedDate, currentStreak, longestStreak } = state;

    if (lastLoggedDate === loggedDate) {
      return state;
    }

    const yesterday = subtractDays(loggedDate, 1);
    let newStreak: number;

    if (lastLoggedDate === yesterday) {
      newStreak = currentStreak + 1;
    } else if (lastLoggedDate === null) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }

    return {
      ...state,
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastLoggedDate: loggedDate,
    };
  }
}
