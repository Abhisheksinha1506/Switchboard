# Arcade Lab

Two original, dependency-free browser prototypes inspired by the mechanics of Grid-16 and Filler. No archive code or assets are copied.

- **Switchboard:** four six-second microgames: catch, dodge, pass gaps, move/stop.
- **Room to Grow:** hold to grow circles; release to settle; avoid moving hazards; claim 40%.
- Both have a 60-second active-play cap and three mistakes. Catch misses only forfeit points. Pausing or hiding the tab stops the clock.
- Move / Stop judges input only after a 0.45-second reaction window following each light change or resume.
- Mouse, touch, and keyboard controls. Room to Grow: arrows position the crosshair (up/down step), Space grows. The starting point stays fixed while growing.

## Run

Open `dist/index.html` in a modern browser, or serve `dist/` with a static HTTP server. Use a consistent origin for repeat visits; localhost and the hosted site have separate storage.

## Study design

Recruit 20–30 independent people from the same intended audience for an exploratory first test. Give neutral instructions: “Try both once, then play whichever you want, or stop.” The first game is randomized per browser and initially enforced. Do not count the developer's QA or coached sessions as participants. Record device type separately when recruiting; neither prototype's raw score can be compared to the other's.

After both games, leave replay optional. Do not offer rewards for extra rounds. Ask testers to return naturally; if reminders are sent, label those as prompted returns outside this dataset.

Each browser stores an anonymous random identifier, assigned order, visits, rounds, and stated preferences. Data never goes to a central service. Ask testers to use **Your results → Export anonymous records**, and manually collect exports with permission. A private Site only works for its owner until its audience is deliberately changed; host `dist/` on a participant-accessible static host or set appropriate Site sharing before external recruitment.

Run `python3 analyze.py export1.json export2.json ...` to aggregate. Multiple exports from the same browser are merged by round ID. Repeated exports are not independent participants. One browser can represent multiple humans; instruct testers to use a separate browser profile per person. No cookies or accounts link devices.

## Metrics

- Primary: participants with a voluntary replay / participants completing at least one round of that game. A replay is a later started round after a completed round, regardless of entry button. A replay after an abandoned first attempt is not counted as voluntary replay until a completed round exists.
- Report replay in all exposed participants and the subset completing both games. The latter excludes dropouts and must not be the only result.
- Secondary: first-round completion, first-round active seconds, latest stated preference after both, and playing again on a later local calendar day. Later-day play is not exact D1 retention.
- Segment by assigned first game to inspect order effects. Raw scores are not comparable across prototypes. Switchboard rounds recorded with `version` 1.0.0 used no Move / Stop reaction window and are not comparable with 1.0.1 rounds.
- Results are exploratory. No automatic winner, market-size estimate, revenue projection, or statistical significance claim is produced. Early failures and device usability may explain replay differences rather than concept appeal.

## Files

`dist/` is deployable static output. `analyze.py` aggregates exports. `checks.cjs` verifies important game and telemetry transitions without writing participant data. Records exist only in the browser, not this repository.
