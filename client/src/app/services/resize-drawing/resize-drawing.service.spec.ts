import { TestBed } from '@angular/core/testing';
import { Resize } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { CANVAS_RESIZING_POINTS } from '@app/ressources/global-variables/canvas-resizing-points';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { ContinueDrawingService } from '@app/services/continue-drawing/continue-drawing.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeDrawingService } from './resize-drawing.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
describe('ResizeDrawingService', () => {
    let service: ResizeDrawingService;
    let mouseEvent: MouseEvent;
    let target: HTMLElement;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    const WIDTH = 100;
    const HEIGHT = 100;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', [
            'clearCanvas',
            'setIsToolInUse',
            'checkDrawing',
            'initializeBaseCanvas',
            'getPreviewData',
            'getCanvasData',
            'autoSave',
        ]);
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        drawServiceSpy.canvas = canvas;
        drawServiceSpy.previewCanvas = canvas;
        drawServiceSpy.baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy.previewCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy.gridCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy.getCanvasData.and.returnValue(drawServiceSpy.baseCtx.getImageData(0, 0, WIDTH, HEIGHT));
        drawServiceSpy.getPreviewData.and.returnValue(drawServiceSpy.baseCtx.getImageData(0, 0, WIDTH, HEIGHT));

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ContinueDrawingService, useValue: {} },
            ],
        });
        service = TestBed.inject(ResizeDrawingService);

        target = {
            id: CANVAS_RESIZING_POINTS.VERTICAL,
        } as HTMLElement;

        mouseEvent = ({
            clientX: 500,
            clientY: 500,
            target,
            button: MouseButton.LEFT,
        } as unknown) as MouseEvent;

        service.previewSize = { x: 400, y: 400 };
        service.canvasSize = { x: 400, y: 400 };
        service['mouseDownCoord'] = { x: 200, y: 400 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set default canvas size to half workspace size', () => {
        service.workSpaceSize = { x: 800, y: 900 };
        service.setDefaultCanvasSize();
        expect(service.previewSize).toEqual({ x: 400, y: 450 });
        expect(service.canvasSize).toEqual({ x: 400, y: 450 });
    });

    it('should set default canvas size to minimum canvas size', () => {
        service.workSpaceSize = { x: 200, y: 200 };
        service.setDefaultCanvasSize();
        expect(service.previewSize).toEqual({ x: 250, y: 250 });
        expect(service.canvasSize).toEqual({ x: 250, y: 250 });
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service['mouseDown']).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service['mouseDown']).toEqual(false);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 500, y: 500 };
        service.onMouseDown(mouseEvent);
        expect(service['mouseDownCoord']).toEqual(expectedResult);
    });

    it(' mouseDown should set serviceCaller to correct value', () => {
        const expectedResult = CANVAS_RESIZING_POINTS.VERTICAL;
        service.onMouseDown(mouseEvent);
        expect(service['serviceCaller']).toEqual(expectedResult);
    });

    it('mouseUp should set mouseDown to false', () => {
        service['mouseDown'] = true;
        service.onMouseUp();
        expect(service['mouseDown']).toBe(false);
    });

    it('mouseUp should leave mouseDown to false', () => {
        service['mouseDown'] = false;
        service.onMouseUp();
        expect(service['mouseDown']).toBe(false);
    });

    it('should get position from mouse', () => {
        expect(service.getPositionFromMouse(mouseEvent)).toEqual({ x: 500, y: 500 });
    });

    it('should change previewSize width', () => {
        service['mouseDown'] = true;
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.VERTICAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 500 });
    });

    it('should not change previewSize width', () => {
        const localMouseEvent = ({
            clientX: 50,
            clientY: 50,
        } as unknown) as MouseEvent;
        service['mouseDown'] = true;
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.VERTICAL;
        service.resizeCanvas(localMouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on verticalResize', () => {
        service['mouseDown'] = false;
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.VERTICAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should change previewSize height', () => {
        service['mouseDown'] = true;
        service['mouseDownCoord'] = { x: 400, y: 200 };
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 500, y: 400 });
    });

    it('should not change previewSize height', () => {
        const localMouseEvent = ({
            clientX: 50,
            clientY: 50,
        } as unknown) as MouseEvent;
        service['mouseDown'] = true;
        service['mouseDownCoord'] = { x: 400, y: 200 };
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.HORIZONTAL;
        service.resizeCanvas(localMouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on horizontalResize', () => {
        service['mouseDown'] = false;
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should change previewSize height and width', () => {
        service['mouseDown'] = true;
        service['mouseDownCoord'] = { x: 400, y: 400 };
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 500, y: 500 });
    });

    it('should not change previewSize height and width', () => {
        const localMouseEvent = ({
            clientX: 50,
            clientY: 50,
        } as unknown) as MouseEvent;
        service['mouseDown'] = true;
        service['mouseDownCoord'] = { x: 400, y: 400 };
        // tslint:disable-next-line: no-any
        spyOn(service as any, 'horizontalResize').and.stub();
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL;
        service.resizeCanvas(localMouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on verticalAndHorizontalResize', () => {
        service['mouseDown'] = false;
        service['serviceCaller'] = CANVAS_RESIZING_POINTS.VERTICAL_AND_HORIZONTAL;
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('should not change previewSize on resizeCanvas', () => {
        service['mouseDown'] = true;
        service['serviceCaller'] = 'not an actual possibility';
        service.resizeCanvas(mouseEvent);
        expect(service.previewSize).toEqual({ x: 400, y: 400 });
    });

    it('canvas should have same context after resize', () => {
        service.drawingService.canvas.width = 20;
        service.drawingService.canvas.height = 20;
        const ctxBeforeResize = service.drawingService.canvas.getContext('2d') as CanvasRenderingContext2D;
        ctxBeforeResize.beginPath();
        ctxBeforeResize.rect(0, 0, 10, 15);
        ctxBeforeResize.fillRect(0, 0, 10, 15);
        ctxBeforeResize.stroke();
        const imageBeforeResize = ctxBeforeResize.getImageData(0, 0, 20, 20);

        service.previewSize = { x: 500, y: 500 };
        service.canvasSize = { x: 20, y: 20 };
        service['mouseDown'] = true;
        service.onMouseUp();

        const ctxAfterResize = service.drawingService.canvas.getContext('2d') as CanvasRenderingContext2D;
        const imageAfterResize = ctxAfterResize.getImageData(0, 0, 20, 20);
        expect(imageAfterResize).toEqual(imageBeforeResize);
    });

    it('should resize canvas onMouseUp if mouseDown is true', () => {
        const expectedResult = { x: 500, y: 500 };
        service.previewSize = { x: 500, y: 500 };
        service.drawingService.canvas.width = service.canvasSize.x;
        service.drawingService.canvas.height = service.canvasSize.y;
        service['mouseDown'] = true;

        service.onMouseUp();
        expect(service.canvasSize).toEqual(expectedResult);
    });

    it('should resize canvas size', () => {
        const expectedResult = { x: 500, y: 500 };
        service.resizeCanvasSize(expectedResult.x, expectedResult.y);
        expect(service.previewSize).toEqual(expectedResult);
    });

    it('should restore canvas', () => {
        const imageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData');
        const expectedData: Resize = {
            type: 'imageText',
            canvasSize: { x: 500, y: 500 },
            imageData: drawServiceSpy.baseCtx.getImageData(0, 0, 100, 100),
        };
        service.restoreCanvas(expectedData);
        expect(service.previewSize).toEqual(expectedData.canvasSize);
        expect(imageDataSpy).toHaveBeenCalled();
    });
});
