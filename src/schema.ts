import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLNonNull,
} from "graphql";

const QueryType = new GraphQLObjectType({
    description: "Root Query",
    fields: {
        testString: {
            type: GraphQLString,
            resolve() {
                return "it works";
            },
        },
        topSecretString: {
            type: GraphQLString,
            resolve(root, args, ctx) {
                if ( false === ctx.isAuthenticated() ) {
                    throw new Error("Permession denied");
                }

                return "it works, but only after login!";
            },
        },
    },
    name: "QueryRoot",
});

const MutationType = new GraphQLObjectType({
    description: "Root Mutation",
    fields: {
        login: {
            args: {
                password: { // NEVER SEND OR SEND PASSWORDS PLAIN! NEVER!
                    type: new GraphQLNonNull(GraphQLString),
                },
                username: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            type: GraphQLString,
            resolve(root: undefined, args: any, ctx) {
                return ctx.login(args.username, args.password);
            },
        },
        logout: {
            args: {},
            type: GraphQLString,
            resolve(root: undefined, args: any, ctx) {
                return ctx.logout();
            },
        },
    },
    name: "MutationType",
});

export const Schema = new GraphQLSchema({
    mutation: MutationType,
    query: QueryType,
});
