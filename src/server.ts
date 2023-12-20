import http, { createServer } from "http";
import Websocket, { Server, WebSocketServer } from "ws";
import fs from "fs";
import { Parser } from "./parser/parser";
import { GeneratingVisitor } from "./generator";
import { getConfigFile } from "./utils";
import path from "path";

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

class SunsettiaServer {
    wss: Websocket.Server;
    server: http.Server;

    constructor() {
        this.wss = new WebSocketServer({ noServer: true });
        this.server = createServer();
    }

    listen(port: number) {
        const config = getConfigFile();

        wss.on("connection", function connection(ws) {
            console.log("Dev server is connected!");
            const watcher = fs.watch(path.dirname(config.entry));

            watcher.on("change", async () => {
                const text = fs.readFileSync(config.entry, "utf-8");
                const parser = new Parser(text);
                parser
                    .parseWait()
                    .then(() => {
                        const generator = new GeneratingVisitor();
                        generator.generate(parser.ast);
                        console.log(parser.ast);
                        fs.writeFileSync(
                            config.outDir || "./app.js",
                            `export default function() {\n${generator.code.join(
                                "\n",
                            )}\n}`,
                        );
                        ws.send("change");
                    })
                    .catch((err) => {
                        ws.send(err.message);
                    });
            });
        });

        server.on("upgrade", function upgrade(request, socket, head) {
            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit("connection", ws, request);
            });
        });

        server.listen(port);
    }
}
