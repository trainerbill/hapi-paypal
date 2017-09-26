import * as glue from "glue";
import * as good from "good";
import * as hapi from "hapi";
import * as index from "../src";
import hapiPayPalRegistration from "../src/glue";

const manifest = {
    connections: [
        {
            host: process.env.IP || "0.0.0.0",
            labels: ["public"],
            port: process.env.PORT || 3000,
        },
    ],
    registrations: [
        {
            plugin: {
                options: {
                    reporters: {
                        console: [{
                            args: [{
                                log: "*",
                                response: "*",
                            }],
                            module: "good-squeeze",
                            name: "Squeeze",
                        }, {
                            module: "good-console",
                        }, "stdout"],
                    },
                },
                register: good.register,
            },
        },
        ...hapiPayPalRegistration,
    ],
};

async function start() {
    try {
        const server = await glue.compose(manifest);
        const servers = await server.start();
        server.table().map((connection: any) => {
            const routes = connection
                            .table
                            .map((route: any) => JSON.stringify({ method: route.method, path: route.path }, null, 2));
            server.log("info", `
Server: ${connection.info.uri}
Labels ${connection.labels.join(",")}
Routes: ${routes}`);
        });
    }  catch (err) {
        throw err;
    }
}

if (!module.parent) {
    start();
}
