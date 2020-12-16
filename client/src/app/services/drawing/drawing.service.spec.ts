import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Fill, Selection } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { ContinueDrawingService } from '@app/services/continue-drawing/continue-drawing.service';
import { DrawingService } from './drawing.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
describe('DrawingService', () => {
    let service: DrawingService;
    const WIDTH = 100;
    const HEIGHT = 100;
    let injectorSpy: jasmine.SpyObj<Injector>;
    let continueDrawingServiceSpy: jasmine.SpyObj<ContinueDrawingService>;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = WIDTH;
        drawCanvas.height = HEIGHT;

        continueDrawingServiceSpy = jasmine.createSpyObj('ContinueDrawingService', ['furtherDrawing']);
        injectorSpy = jasmine.createSpyObj('injector', ['get']);
        // tslint:disable-next-line: deprecation
        injectorSpy.get.and.returnValue(continueDrawingServiceSpy);
        TestBed.configureTestingModule({
            providers: [],
        });
        service = TestBed.inject(DrawingService);
        // tslint:disable-next-line: no-string-literal
        service['injector'] = injectorSpy;
        service.canvas = canvas;
        service.baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.gridCtx = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('should return isLastDrawing', () => {
        service.isLastDrawing = false;
        expect(service.checkedDrawing()).toEqual(false);
    });

    it('should initialize canvas as all white canvas', () => {
        const fillRectSpy = spyOn(service.baseCtx, 'fillRect');
        service.initializeBaseCanvas();
        expect(service.baseCtx.fillStyle).toEqual('#ffffff');
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, service.canvas.width, service.canvas.height);
    });

    it('should return true if the canvas is blank', () => {
        service.initializeBaseCanvas();
        expect(service.isCanvasBlank(service.baseCtx)).toEqual(true);
    });

    it('should return false if the canvas is not blank', () => {
        service.initializeBaseCanvas();
        service.baseCtx.fillStyle = 'red';
        service.baseCtx.fillRect(0, 0, 1, 1);
        expect(service.isCanvasBlank(service.baseCtx)).toEqual(false);
    });

    it('should get pixelData from baseCtx', () => {
        const pixel: Vec2 = { x: 1, y: 1 };
        const expectedResult: Uint8ClampedArray = new Uint8ClampedArray([255, 0, 0, 255]);

        service.initializeBaseCanvas();
        service.baseCtx.fillStyle = 'red';
        service.baseCtx.fillRect(1, 1, 1, 1);

        expect(service.getPixelData(pixel)).toEqual(expectedResult);
    });

    it('should get ImageData from baseCtx', () => {
        const pixels: Uint8ClampedArray = new Uint8ClampedArray([255, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
        const expectedCanvasData: ImageData = { data: pixels, height: 2, width: 2 };

        service.canvas.width = 2;
        service.canvas.height = 2;

        service.initializeBaseCanvas();
        service.baseCtx.fillStyle = 'red';
        service.baseCtx.fillRect(0, 0, 1, 1);
        const canvasData = service.getCanvasData();
        expect(canvasData.data).toEqual(expectedCanvasData.data);
        expect(canvasData.width).toEqual(expectedCanvasData.width);
        expect(canvasData.height).toEqual(expectedCanvasData.height);
    });

    it('should drawfill on basectx', () => {
        const imageDataSpy = spyOn(service.baseCtx, 'putImageData');
        const fill: Fill = { type: {} as string, imageData: {} as ImageData };
        service.drawFill(fill);
        expect(imageDataSpy).toHaveBeenCalled();
    });

    it('should restore selection on basectx', () => {
        const imageDataSpy = spyOn(service.baseCtx, 'putImageData');
        const selection: Selection = { type: {} as string, imageData: {} as ImageData };
        service.restoreSelection(selection);
        expect(imageDataSpy).toHaveBeenCalled();
    });

    it('should get data on basectx', () => {
        const imageDataSpy = spyOn(service.previewCtx, 'getImageData');
        service.getPreviewData();
        expect(imageDataSpy).toHaveBeenCalled();
    });

    it('should draw grid on setgrid', () => {
        service.canvas.width = 10;
        service.canvas.height = 10;
        service.gridSpacing = 5;
        const moveToSpy = spyOn(service.gridCtx, 'moveTo');
        const lineToSpy = spyOn(service.gridCtx, 'lineTo');
        service.setGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(6);
        expect(lineToSpy).toHaveBeenCalledTimes(6);
    });

    it('should drawimage on basectx on applyPreview call', () => {
        const baseCtxSpy = spyOn(service.baseCtx, 'drawImage');
        const clearCanvasSpy = spyOn(service, 'clearCanvas');
        service.applyPreview();
        expect(baseCtxSpy).toHaveBeenCalled();
        expect(clearCanvasSpy).toHaveBeenCalled();
    });

    it('should not call setGrid on initializeBaseCanvas if grid is disabled', () => {
        service.isGridEnabled = false;
        const setGridSpy = spyOn(service, 'setGrid');
        service.initializeBaseCanvas();
        expect(setGridSpy).not.toHaveBeenCalled();
    });

    it('should call setGrid on initializeBaseCanvas if grid is enabled', () => {
        service.isGridEnabled = true;
        const setGridSpy = spyOn(service, 'setGrid');
        service.initializeBaseCanvas();
        expect(setGridSpy).toHaveBeenCalled();
    });

    it('should not call clear of localStorage if canvas is undefined', () => {
        const clearSpy = spyOn(localStorage, 'clear');
        service.canvas = (undefined as unknown) as HTMLCanvasElement;
        service.autoSave();
        expect(clearSpy).not.toHaveBeenCalled();
    });
});
