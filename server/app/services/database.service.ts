import {
    DATABASE_COLLECTION,
    DATABASE_NAME,
    DATABASE_URL_BEGINNING,
    DATABASE_URL_END,
    MAX_NAME_LENGTH,
    MAX_NUMBER_TAG,
    MAX_TAG_LENGTH,
} from '@app/ressources/global-variables';
import { DBData, MetaData } from '@common/communication/drawing-data';
import * as fs from 'fs';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import * as multer from 'multer';
import 'reflect-metadata';
@injectable()
export class DatabaseService {
    collection: Collection<MetaData>;
    client: MongoClient;
    DIR: string = './images';
    IMAGE_PATH: string = '../../images/';
    multerObject: multer.Multer;
    mongoURL: string = DATABASE_URL_BEGINNING + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + DATABASE_URL_END;
    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start(): void {
        MongoClient.connect(this.mongoURL, this.options)
            .then((client: MongoClient) => {
                this.client = client;
                this.collection = client.db(DATABASE_NAME).collection(DATABASE_COLLECTION);
            })
            .catch(() => {
                console.error('CONNECTION ERROR. EXITING PROCESS');
                process.exit(1);
            });
        if (!fs.existsSync(this.DIR)) {
            fs.mkdirSync(this.DIR);
        }
    }

    closeConnection(): void {
        this.client.close();
    }

    getImagePath(): string {
        return this.IMAGE_PATH;
    }

    getDirPath(): string {
        return this.DIR;
    }

    createMulterUpload(directory: string): multer.Multer {
        this.multerObject = multer({ dest: directory });
        return this.multerObject;
    }

    isValidData(dBData: DBData): boolean {
        if (!dBData.name.length) {
            return false;
        }

        if (dBData.name.length > MAX_NAME_LENGTH) {
            return false;
        }

        if (Array.isArray(dBData.tags)) {
            if (dBData.tags.length > MAX_NUMBER_TAG) {
                return false;
            }
            for (const tag of dBData.tags) {
                if (tag.length > MAX_TAG_LENGTH) {
                    return false;
                }
            }
        }
        return true;
    }
    async addDrawing(DBDATA: DBData): Promise<void> {
        if (!this.isValidData(DBDATA)) {
            fs.unlinkSync('./images/' + DBDATA.fileName);
            throw new Error('Métadonnées du dessin non valides');
        } else {
            await this.collection.insertOne(DBDATA);
        }
    }
    async deleteDrawing(fileNameToDelete: string): Promise<void> {
        const files: string[] = fs.readdirSync(this.DIR);
        if (files.includes(fileNameToDelete)) {
            await this.collection.findOneAndDelete({ fileName: fileNameToDelete });
            try {
                fs.unlinkSync('./images/' + fileNameToDelete);
            } catch (error) {
                throw new Error("Problème lors de la suppression de l'image");
            }
        } else throw new Error('Image introuvable');
    }

    async getDBData(): Promise<DBData[]> {
        return this.collection
            .find()
            .toArray()
            .then((dBData: DBData[]) => {
                const dBDataverified: DBData[] = [];
                const files: string[] = fs.readdirSync(this.DIR);
                for (const data of dBData) {
                    if (files.includes(data.fileName)) {
                        dBDataverified.push(data);
                    }
                }
                return dBDataverified;
            });
    }
}
