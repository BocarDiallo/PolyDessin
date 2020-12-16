import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { DBData, ID_NAME, NAME, TAGS_NAME } from '@common/communication/drawing-data';
import { NextFunction, Request, Response, Router } from 'express';
import * as fs from 'fs';
import * as Httpstatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import * as multer from 'multer';
import * as path from 'path';

@injectable()
export class DatabaseController {
    router: Router;
    DIR: string;
    IMAGES_PATH: string;
    upload: multer.Multer;

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.DIR = this.databaseService.getDirPath();
        this.upload = this.databaseService.createMulterUpload(this.DIR);
        this.IMAGES_PATH = this.databaseService.getImagePath();
        this.configureRouter();
        this.databaseService.start();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/addDrawing', this.upload.single('image'), (req: Request, res: Response, next: NextFunction) => {
            const savedFileName = req.file.filename;
            let drawingTags: string[];
            if (!req.body[TAGS_NAME]) drawingTags = [''];
            else drawingTags = req.body[TAGS_NAME];
            if (!Array.isArray(drawingTags)) drawingTags = [drawingTags];
            const DBDATA: DBData = {
                id: req.body[ID_NAME],
                name: req.body[NAME],
                tags: drawingTags,
                fileName: savedFileName,
            };
            this.databaseService
                .addDrawing(DBDATA)
                .then(() => {
                    res.sendStatus(Httpstatus.StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.get('/getDrawingPng/:filename', (req: Request, res: Response, next: NextFunction) => {
            const files: string[] = fs.readdirSync(this.DIR);
            if (files.includes(req.params.filename)) {
                res.status(Httpstatus.StatusCodes.OK);
                res.contentType('image/png');
                res.sendFile(req.params.filename, { root: path.join(__dirname, this.IMAGES_PATH) });
            } else {
                res.status(Httpstatus.StatusCodes.NOT_FOUND);
                const error = new Error('Drawing not found');
                res.send(error.message);
            }
        });

        this.router.delete('/deleteDrawing/:fileName', (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .deleteDrawing(req.params.fileName)
                .then(() => {
                    res.sendStatus(Httpstatus.StatusCodes.NO_CONTENT);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.get('/getDBData', (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .getDBData()
                .then((dbData: DBData[]) => {
                    res.send(dbData);
                })
                .catch((error: Error) => {
                    res.status(Httpstatus.StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
