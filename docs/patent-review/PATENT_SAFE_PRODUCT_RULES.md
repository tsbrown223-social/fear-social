# Patent-Safe Product Architecture Rules

These are release gates for fear.social. They preserve the technical distinctions identified in the July 20, 2026 preliminary U.S. patent review.

## Feed

- Keep ranking deterministic, inspectable, and based on explicit user-supplied profile fields, direct follows, visible engagement totals, post type, and recency.
- Do not collect dwell time, replays, pause behavior, activation events, device state, network quality, or sensor data for ranking without a new review.
- Do not train or periodically retrain ranking models.
- Do not create cohort-specific models, dual rankers, score-calibration models, affinity-weighted connected-user aggregates, embeddings, or a learned second pass without a new review.
- Keep Following chronological and limited to direct follows.
- Record every ranking-input change in the release notes.

## People discovery

- “New people” may use transparent ordering such as recent accounts, alphabetical order, or a user-selected field filter.
- Do not compare a reference profile with candidate profile sections to produce section subscores or a composite similarity score without a new review.
- Do not infer a recommended DM recipient from drafted message text, social paths, or relationship predictions without a new review.

## Deals

- Explain the percentage as profile/listing overlap, not likelihood of interview, offer, employment, or success.
- Use fields deliberately supplied by the user: field, stated goals, looking-for text, location, and listing text.
- Do not parse resumes, learn from applicant populations, infer job skills from applicants, or predict hiring outcomes without a new review.
- Do not recommend profile changes as a way to increase a predicted job-offer score without a new review.

## Posts and media

- Daily Drops are persistent posts in the ordinary feed.
- Do not add Stories, expiring collections, a Stories tray, or predicted direct-message probability without a new review.
- Do not add a one-item full-screen vertical swipe player, automatic next-video flow, or embedded recommend-to-friend control without a new review.
- Keep fear.social’s visual language distinct: green/black/white palette, serif/sans pairing, card-based information architecture, and original icon/navigation composition.

## Comments, activity, and groups

- Keep comments chronological unless counsel clears a ranking design.
- Keep activity notifications chronological unless counsel clears a ranking design.
- Do not broadcast profile updates to inferred communities or rank group notices from interaction predictions without a new review.

## Required review trigger

Product and engineering must request a new patent screen before implementing any of the following:

- Any machine-learning recommender or automatic weight fitting
- Embeddings or vector similarity
- Behavioral telemetry used for ordering content
- Stories or expiring posts
- Full-screen vertical media pagination
- Ranked comments or notifications
- Resume parsing, hiring predictions, applicant-skill inference, or career-score advice
- Profile-similarity people recommendations
- Suggested message recipients
- A major mobile-app GUI redesign

## Release evidence

For every material release, retain:

- Dated screenshots for desktop and mobile
- The ranking function and input list
- Database schema and migrations
- User-facing labels and score explanations
- A brief statement of whether any review trigger changed

This file is an engineering control, not legal advice. Legal status and infringement risk must be reviewed by qualified counsel.
