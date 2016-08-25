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
const SESSION_OPTS = {
    cookie: { maxAge: 60000, secure: false },
    resave: false,
    saveUninitialized: false,
    secret: "Sup3rH4rdP4$$w0rd",
};
if ( "production" === NODE_ENV ) {
    SESSION_OPTS.cookie.secure = true;
};

const GRAPHQL_ROUTE = "/graphql";
const GRAPHIQL_ROUTE = "/graphiql";

let app = express();
app.use(helmet());
app.use(morgan(NODE_ENV));
if ( true === ENABLE_CORS ) {
    app.use(GRAPHQL_ROUTE, cors());
}
app.use(session(SESSION_OPTS));

app.use(GRAPHQL_ROUTE, bodyParser.json(), apolloExpress(function(req, res) {
    console.log(req.session);
    return {
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
