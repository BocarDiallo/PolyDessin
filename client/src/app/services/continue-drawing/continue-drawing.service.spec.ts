import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ContinueDrawingService } from '@app/services/continue-drawing/continue-drawing.service';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';
import { ServerResponseService } from '@app/services/server-response/server-response.service';

// tslint:disable: no-string-literal
// tslint:disable no-magic-numbers
// tslint:disable: no-empty
describe('ContinueDrawingService', () => {
    let service: ContinueDrawingService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let serverResponseService: jasmine.SpyObj<ServerResponseService>;
    let dataBaseService: jasmine.SpyObj<DatabaseService>;
    let resizeDrawingServiceSpy: jasmine.SpyObj<ResizeDrawingService>;
    let router: Router;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    const WIDTH = 100;
    const HEIGHT = 100;
    const storageContent: Storage = {
        length: 4 as number,
        getItem: () => {
            return '';
        },
        setItem: () => {},
        clear: () => {},
        removeItem: () => {},
        key(): string {
            return '';
        },
    };

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        context = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['autoSave', 'clearCanvas']);
        resizeDrawingServiceSpy = jasmine.createSpyObj('ResizeDrawingService', ['resizeCanvasSize']);
        serverResponseService = jasmine.createSpyObj('ServerResponseService', ['sendMailConfirmSnackBar']);
        dataBaseService = jasmine.createSpyObj('DataBaseService', ['deleteDrawing']);
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ResizeDrawingService, useValue: resizeDrawingServiceSpy },
                { provide: ServerResponseService, useValue: serverResponseService },
                { provide: DatabaseService, useValue: dataBaseService },
            ],
            imports: [RouterTestingModule],
        });
        service = TestBed.inject(ContinueDrawingService);
        service['drawingService'] = drawingServiceSpy;
        service['router'] = router;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call continueDrawing', () => {
        spyOn(service, 'convertURIToImageData').and.stub();
        spyOn(storageContent, 'getItem').and.returnValue(canvas.toDataURL());
        service['drawingService'].canvas = canvas;
        Object.defineProperty(window, 'localStorage', {
            value: storageContent,
            configurable: true,
            enumerable: true,
            writable: true,
        });
        service.continueDrawing();
        expect(storageContent.getItem).toHaveBeenCalled();
    });

    it('should call convertURIToImage', (done) => {
        service['drawingService'].canvas = canvas;
        spyOn(context, 'drawImage').and.stub();
        service['drawingService'].baseCtx = context;
        service.convertURIToImageData(canvas.toDataURL(), 5, 5).then((res) => {
            expect(context.drawImage).toHaveBeenCalled();
            done();
        });
    });

    it('should load old drawing', () => {
        service.loadOldDrawing();
        expect(router.navigateByUrl).toHaveBeenCalled();
    });

    it('should set last drawing', () => {
        service.setLastDrawing();
        expect(drawingServiceSpy.isLastDrawing).toBeTruthy();
    });

    it('should set last drawing to false', () => {
        service.unlockContinueDrawing();
        expect(drawingServiceSpy.isLastDrawing).toBeFalsy();
    });

    it('should clear canvas', () => {
        service.clearCanvas();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });
});
