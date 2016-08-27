import * as express from "express";
import * as bodyParser from "body-parser";
import { apolloExpress, graphiqlExpress } from "apollo-server";
import { Schema } from "./schema";
import * as cors from "cors";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as session from "express-session";

// Either to export GraphiQL (Debug Interface) or not.
const NODE_ENV = process.env.NODE_ENV !== "production" ? "dev" : "production";
const EXPORT_GRAPHIQL = NODE_ENV !== "production";
// Default port or given one.
const PORT = process.env.PORT || 3000;
// Enable cors (cross-origin HTTP request) or not.
const ENABLE_CORS = NODE_ENV !== "production";
// This is just for the demo, use a decent store please :)
const USER_STORE = {
    password: "1234",
    username: "auth-demo",
};
const SESSION_OPTS = {
    cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: false,
    // Please, don't store your secrets in the code.
    // use environment variables or configuration file which is not in git. ;)
    secret: "Sup3rH4rdP4$$w0rd",
};
if ( "production" === NODE_ENV ) {
    SESSION_OPTS.cookie.secure = true;
};

const GRAPHQL_ROUTE = "/graphql";
const GRAPHIQL_ROUTE = "/graphiql";

// TODO: Find a decent users/accounts library, and replace it with it.
// passport doesn't support authenticating without being a middlewere.
const loginMethod = (username, password) => {
    if ( (username !== USER_STORE.username) ||
         (password !== USER_STORE.password ) ) {
        throw new Error("Incorrect Credentials");
    }
    return { username: username };
};

let app = express();
app.use(helmet());
app.use(morgan(NODE_ENV));
if ( true === ENABLE_CORS ) {
    app.use(GRAPHQL_ROUTE, cors());
}
app.use(session(SESSION_OPTS));

app.use(GRAPHQL_ROUTE, bodyParser.json(), apolloExpress(function(req, res) {
    return {
        context: {
            isAuthenticated: () => {
                return req.session.hasOwnProperty("userInfo");
            },
            login: (username, password) => {
                /* tslint:disable:no-string-literal */
                req.session["userInfo"] = loginMethod(username, password);
                return "success";
            },
            logout: () => {
                if ( undefined === req.session ) {
                    return Promise.resolve("success");
                }

                return new Promise((resolve, reject) => {
                    req.session.destroy((err) => {
                        if ( err ) {
                            reject(err);
                            return;
                        }
                        resolve("success");
                    });
                });
            },
            session: req.session,
        },
        schema: Schema,
    };
}));

if ( true === EXPORT_GRAPHIQL ) {
    app.use(GRAPHIQL_ROUTE, graphiqlExpress({
        endpointURL: GRAPHQL_ROUTE,
    }));
}
app.listen(PORT, () => {
    console.log(`GraphQL Server is now running on http://localhost:${PORT}${GRAPHQL_ROUTE}`);
    if ( true === EXPORT_GRAPHIQL ) {
        console.log(`GraphiQL Server is now running on http://localhost:${PORT}${GRAPHIQL_ROUTE}`);
    }
});
