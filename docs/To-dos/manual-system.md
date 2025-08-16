The repository you shared is organised with a `src/game` folder and a `ui` folder, plus data and docs.  Your game already has systems like laws, proficiency and various skills.  Manuals are absent, so you’d need to design both back‑end structures and front‑end UI for them.

**Core concept**

Manuals work like skill books in EVE Online: you discover or buy them, queue them, and they read passively.  Each manual gives either an active ability or a passive bonus.  Manual reading uses real time; low levels take minutes or hours, higher levels can take days.  The speed depends on the character’s **Mind** and possibly other attributes.  When a manual finishes reading, you “learn” its effect permanently (for that life).

**Manual categories**

* **Ability manuals** – unlock new combat skills, alchemy recipes, advanced gathering methods or cultivation techniques.
* **Passive manuals** – increase Qi regen, reduce tribulation damage, boost yields or shorten mining/cooking times.
* **Law manuals** – integrate with your existing Law system; learning a Law manual might reduce time to switch laws or unlock more powerful law effects.
* **Weapon proficiency manuals** – boost proficiency gain for a weapon class (e.g. “Sword Arts Volume I” increases sword proficiency rate by 5%).

**Integration with existing systems**

* **Mind attribute**: reading speed scales with Mind; the first levels of a manual have a base time (e.g. 1 hour at Mind=10), multiplied down by Mind bonuses.  Higher tiers require progressively higher Mind to reduce multi‑day reading times.
* **Laws**: each law could grant discounts or synergies for certain manual categories.  For example, following the Law of Lightning might reduce reading time for lightning‑element manuals or unlock a hidden chapter in those manuals.
* **Proficiency**: manual abilities often have minimum proficiency levels to use them.  Reading a “Sword Mastery Manual II” might require 50 sword proficiency and grant +10 proficiency when finished.  This encourages interplay between active fighting and manual reading.
* **Sect buildings**: build a “Scripture Pavilion” or “Reading Hall” that increases manual reading speed or allows multiple manuals to be read simultaneously.  Upgrading the building could add more queue slots.

**Game‑play loop**

1. **Finding manuals** – drop from adventure bosses, sect missions, random events, alchemy experiments or as rewards for quests.  Rare manuals might drop only in certain zones.
2. **Queueing manuals** – add a “Manuals” tab in the left panel.  It shows discovered manuals, their category, current level (I–VI), reading time per level and their effect.  Players select a manual and click “Start Reading”; the game then tracks progress even when offline.  A queue system (similar to EVE) lets you schedule several manuals; when one finishes, the next begins if there’s enough Qi/Mind and the prerequisites are met.
3. **Learning & levelling** – each manual has multiple levels; the first level gives a modest effect and unlocks usage; later levels grant stronger multipliers or reduce cooldowns.  Each level’s reading time is typically ×5–×10 the previous one.  Reading costs some Qi per second (representing mental effort) and can be paused or cancelled.  If paused, progress is preserved.
4. **Combining with reincarnation** – on reincarnation (prestige), manuals reset to level 0 but perhaps retain a percentage of reading progress or grant “Manual Insight Points” that speed up reading in the next life.  This gives manuals long‑term value across runs.

**Data structures**

* **Manual object**: `id`, `name`, `category`, `maxLevel`, `level`, `baseTime` (time for level 1), `effect` (function to apply the bonus), `prerequisites` (e.g. min Mind, proficiency or law), `unlocked` flag.
* **Manual queue**: list of manuals in progress, each with remaining time and whether paused.  Include concurrency limits based on sect buildings.
* **Player state**: add `manualsDiscovered` dictionary and `manualQueue` array; include reading speed multiplier from Mind and building bonuses.

**UI suggestions**

* Add a **Manuals** button in the Activities list.  It opens a panel with two columns: left shows library of discovered manuals grouped by category; right shows the queue and current reading progress.
* Each manual entry shows an icon, title, current level and next‑level effect.  Hovering shows prerequisites and total time.  Buttons: “Read” (starts reading if no queue limit), “Queue Next Level” and “Abandon”.
* When reading, show a progress bar with time remaining and highlight when the player reaches the final minutes; add small animations (glowing pages, flipping book) to make it feel alive.

**Balancing notes**

* Manual reading times should scale with overall game pace.  If cultivating to a new realm takes hours, manual levels should take minutes/hours.  Balance the first few levels to be accessible early, and the last ones to require long‑term planning.
* To avoid trivialising combat or resource production, make manual bonuses modest and complementary rather than strictly better than existing upgrades.
* Tie manual drop rates to adventure: deeper zones drop higher‑tier manuals.  This encourages exploring new areas.

By designing manuals as a long‑term passive progression tied to Mind, laws and proficiency, you create another layer of strategic depth without overwhelming players.  They choose which manuals to pursue based on current goals—damage, survivability, resource gain or unlocking new features.  This also makes the Law and proficiency systems more relevant: following certain laws and wielding certain weapons becomes more desirable if it speeds up important manuals.
