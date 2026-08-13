# fear.social iOS release path

The repository now has a Capacitor 8 native boundary, safe-area and keyboard behavior, a production API origin for installed builds, native OAuth return handling, permission descriptions, and a privacy manifest. This is an App Store preparation path, not a guarantee of approval; Apple makes the final review decision.

## Build the native project

1. Install full Xcode 26 or newer from the Mac App Store and open it once.
2. Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` if the command-line tools are still selected.
3. Run `npm run ios:install` when npm registry access is available. This records the pinned Capacitor 8 packages in `package.json` and `package-lock.json`.
4. Run `npm run ios:add` once to generate `ios/`.
5. Run `npm run ios:open`, choose the fear.social team, and confirm bundle ID `social.fear.app`.
6. For later web changes, run `npm run ios:sync` before archiving.

## Apple sign-in and deep links

Because the app offers Google as a primary account login, Apple guideline 4.8 generally requires an equivalent login option. The UI and backend path are ready for Sign in with Apple and remain hidden until these Cloudflare secrets exist:

- `APPLE_CLIENT_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_REDIRECT_URI=https://fear.social/api/auth/apple/callback`

Register `fearsocial` as the callback URL scheme in the Xcode target. `npm run ios:add` copies the supplied configuration into the generated project. Google and Apple native flows return through `fearsocial://auth` and exchange only a short-lived, single-use OAuth state on the server.

## App Store Connect disclosures

- Privacy policy URL: `https://fear.social/#privacy`
- Support contact: `contact@fear.social`
- Complete the App Privacy answers to match `native/ios/PrivacyInfo.xcprivacy`: name, email, user ID, photos/videos, messages, other user content, and search history are linked to the user for app functionality or personalization; no tracking is declared.
- Review the privacy manifest in Xcode's privacy report after every native dependency change.
- Complete export-compliance questions accurately. The app uses HTTPS and includes user-to-user message encryption features; obtain counsel if an ERN or other filing is required for the final encryption implementation.
- Use the UGC age-rating questions and describe report, block, content filtering, account deletion, and the 24-hour moderation workflow in review notes.
- Provide Apple a working review account and keep the production backend available during review.
- Do not label the App Store production build as a beta. Use TestFlight for pre-release builds.
- If FEAR Pro later sells digital features inside iOS, implement Apple In-App Purchase before enabling checkout.

## Final device QA

- Test current and oldest supported iPhone sizes in portrait, including large Dynamic Type.
- Test sign up, email verification, Google login, Apple login, password recovery, logout/login, and account deletion.
- Test camera, microphone, photo picker, posting, DMs, report/block, group leaving, and private-profile requests.
- Test on Wi-Fi, cellular, offline/reconnect, and an IPv6-only network.
- Confirm VoiceOver labels, focus order, contrast, reduced motion, and 44-point touch targets.
- Archive with the Release configuration, run Xcode validation, then distribute to TestFlight first.
