import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { conf } from "../../conf/conf.js";
import { googleAuthCallback } from "../../controllers/auth.controller.js";
import { User } from "../../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: conf.googleClientId,
            clientSecret: conf.googleClientSecret,
            callbackURL: `${conf.apiEndPoint}/api/v1/auth/google/callback`,
        },
        googleAuthCallback
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;
