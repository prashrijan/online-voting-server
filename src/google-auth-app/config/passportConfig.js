import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { conf } from "../../conf/conf.js";
import { googleAuthCallback } from "../../controllers/auth.controller.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: conf.googleClientId,
            clientSecret: conf.googleClientSecret,
            callbackURL: "/api/v1/auth/google/callback",
        },
        googleAuthCallback
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
