import http from "node:http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 6969,
});

wss.on("connection", function connection(ws) {
    console.log("Connection established with client");
    ws.on("error", console.error);

    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });

    const watcher = fs.watch("./src/__tests__/app/src/index.sun");

    watcher.on("error", console.error);
    watcher.on("change", () => ws.send("change"));
});
