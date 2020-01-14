import Logger from "./helper/Logger";
import express from "express";
import http from "http";
import path from "path";

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
        const httpServerPublic: string = path.resolve(__dirname, "public");

        this.expressApp = express();
        this.expressApp.use(express.static(httpServerPublic));
        this.httpServer = http.createServer(this.expressApp);
        this.httpServer.listen(httpServerPort, () => {
            logger.info("httpServer listening on port " + httpServerPort);
        });

        this.httpLog();
    }

    /**
     * http request logging
     */
    private httpLog = () => {
        const logger = this.logger.child({
            method: "httpLog",
        });

        this.expressApp.use((req, res, next) => {
            logger.info({
                request: {
                    host: req.host,
                    ip: req.ip,
                    protocol: req.protocol,
                },
                response: {
                    statusCode: res.statusCode,
                },
            });
            next();
        });
    }
}
