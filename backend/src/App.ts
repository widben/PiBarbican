import Logger from "./helper/Logger";
import express from "express";
import http from "http";

export default class App extends Logger {
    private logger = App.logger.child({
        class: "App",
    });
    private readonly expressApp: express.Application;
    private readonly httpServer: http.Server;

    constructor() {
        super();

        const logger = this.logger.child({
            method: "consturctor",
        });
        const httpServerPort: number = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 3001;

        this.expressApp = express();
        this.httpServer = http.createServer(this.expressApp);
        this.httpServer.listen(httpServerPort, () => {
            logger.info("httpServer listening on port " + httpServerPort);
        });
    }
}
