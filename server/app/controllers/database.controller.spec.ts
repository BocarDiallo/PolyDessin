import { expect } from 'chai';
import * as fs from 'fs';
import * as Httpstatus from 'http-status-codes';
import * as multer from 'multer';
import * as supertest from 'supertest';
import { DBData } from '../../../common/communication/drawing-data';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { DatabaseService } from '../services/database.service';
import { TYPES } from '../types';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NO_CONTENT = 204;
const NOT_FOUND = 404;

describe('DatabaseController', () => {
    let databaseService: Stubbed<DatabaseService>;
    let app: Express.Application;
    let testDBData: DBData;
    const testingImagesPath = './testing-images/';

    beforeEach(async () => {
        testDBData = { id: '5', name: 'randomName', tags: ['tag1', 'tag2'], fileName: 'fileNameRandom' };
        const multerTest: multer.Multer = multer({ dest: './testing-images' });
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            getDBData: sandbox.stub().resolves([testDBData, testDBData]),
            deleteDrawing: sandbox.stub().resolves(),
            addDrawing: sandbox.stub().resolves(),
            start: sandbox.stub().resolves(),
            getImagePath: sandbox.stub().returns('../../testing-images/'),
            getDirPath: sandbox.stub().returns('./testing-images/'),
            createMulterUpload: sandbox.stub().returns(multerTest),
        });
        databaseService = container.get(TYPES.DatabaseService);
        app = container.get<Application>(TYPES.Application).app;
    });

    afterEach(async () => {
        const files: string[] = fs.readdirSync(testingImagesPath);
        for (const file of files) {
            if (file !== 'fileNameRandom') {
                fs.unlinkSync(testingImagesPath + file);
            }
        }
    });

    it('should add drawing on valid post request to root', async () => {
        return supertest(app)
            .post('/api/database/addDrawing')
            .attach('image', './testing-images/fileNameRandom')
            .field({ id: 'test', name: 'meta', tags: 'tag' })
            .expect(HTTP_STATUS_NO_CONTENT);
    });

    it('should add drawing on valid post request to root with tag array', async () => {
        return supertest(app)
            .post('/api/database/addDrawing')
            .attach('image', './testing-images/fileNameRandom')
            .field({ id: 'test', name: 'meta', tags: ['tag', 'tag2'] })
            .expect(HTTP_STATUS_NO_CONTENT);
    });

    it('should add drawing on valid post request to root with no tag', async () => {
        return supertest(app)
            .post('/api/database/addDrawing')
            .attach('image', './testing-images/fileNameRandom')
            .field({ id: 'test', name: 'meta', tags: [] })
            .expect(HTTP_STATUS_NO_CONTENT);
    });

    it('should return error on invalid post request to root', async () => {
        databaseService.addDrawing.rejects(new Error('service error'));
        return supertest(app)
            .post('/api/database/addDrawing')
            .attach('image', './testing-images/fileNameRandom')
            .field({ id: 'test', name: 'meta', tags: 'tag' })
            .expect(Httpstatus.StatusCodes.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('service error');
            });
    });

    it('should return dbdata from database service on valid get request to getDBData', async () => {
        return supertest(app)
            .get('/api/database/getDBData')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([testDBData, testDBData]);
            });
    });

    it('should  send image on valid get request ', async () => {
        return supertest(app)
            .get('/api/database/getDrawingPng/fileNameRandom')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                const size = fs.statSync('./testing-images/fileNameRandom').size.toString();
                expect(response.header['content-length']).to.equal(size);
            });
    });

    it('should  send error on invalid get request of image', async () => {
        return supertest(app)
            .get('/api/database/getDrawingPng/invalidname')
            .expect(NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('Drawing not found');
            });
    });

    it('should delete image file on valid delete request', async () => {
        return supertest(app).delete('/api/database/deleteDrawing/:filename').send({ filename: 'filenamerandom' }).expect(HTTP_STATUS_NO_CONTENT);
    });

    it('should return an error as a message on deleteDrawing service fail', async () => {
        databaseService.deleteDrawing.rejects(new Error('service error'));
        return supertest(app)
            .delete('/api/database/deleteDrawing/:filename')
            .send({ filename: 'filenamerandom' })
            .expect(Httpstatus.StatusCodes.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('service error');
            });
    });

    it('should return an error as a message on get dbdata service fail', async () => {
        databaseService.getDBData.rejects(new Error('service error'));
        return supertest(app)
            .get('/api/database/getDBData')
            .expect(Httpstatus.StatusCodes.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('service error');
            });
    });
});
