import { TestBed } from '@angular/core/testing';
import { MouseButton, ONE_SECOND } from '@app/ressources/global-variables/global-variables';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';
import { SprayService } from './spray.service';

// tslint:disable:no-string-literal
// tslint:disable: no-empty
// tslint:disable: no-magic-numbers
// tslint:disable: max-file-line-count
describe('SprayService', () => {
    let service: SprayService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoStackServiceSpy: jasmine.SpyObj<UndoRedoStackService>;
    let colorSelectionServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['applyPreview', 'clearCanvas', 'autoSave', 'getCanvasData']);
        undoRedoStackServiceSpy = jasmine.createSpyObj('UndoRedoStackService', ['setIsToolInUse', 'updateStack']);
        colorSelectionServiceSpy = jasmine.createSpyObj('ColorSelectionService', ['getRgbaPrimaryColor']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorSelectionService, useValue: colorSelectionServiceSpy },
                { provide: UndoRedoStackService, useValue: undoRedoStackServiceSpy },
            ],
        });
        service = TestBed.inject(SprayService);

        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
    });

    afterEach(() => {
        if (service.timeoutId) {
            clearTimeout(service.timeoutId);
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ngOnDestroy should clearTimeout', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');

        service.ngOnDestroy();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it(' mouseDown should set filter of baseCtx and previewCtx to none', () => {
        const mouseEvent = {
            button: MouseButton.RIGHT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(service['drawingService'].baseCtx.filter).toEqual('none');
        expect(service['drawingService'].previewCtx.filter).toEqual('none');
    });

    it(' mouseDown should call setTimeout on left click', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalledWith(
            service.drawSpray,
            ONE_SECOND / service.sprayFrequency,
            service,
            service['drawingService'].previewCtx,
        );
    });

    it(' mouseDown should set mouseDown to true on left click', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseDown = false;
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalled();
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseCoord on left click', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseCoord = { x: 0, y: 0 };
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalled();
        expect(service.mouseCoord).toEqual({ x: 25, y: 25 });
    });

    it(' mouseDown should call drawingService.setToolInUse on left click', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseCoord = { x: 0, y: 0 };
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalled();
        expect(undoRedoStackServiceSpy.setIsToolInUse).toHaveBeenCalledWith(true);
    });

    it(' mouseUp should call clearTimeout if mousDown is true', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = true;

        service.onMouseUp();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it(' mouseUp should set mouseDown to false', () => {
        service.mouseDown = true;

        service.onMouseUp();

        expect(service.mouseDown).toEqual(false);
    });

    it(' mouseUp should call drawingService.applyPreview if mousDown is true', () => {
        service.mouseDown = true;

        service.onMouseUp();

        expect(drawServiceSpy.applyPreview).toHaveBeenCalled();
    });

    it(' mouseUp should call drawingService.setIsToolInUse if mousDown is true', () => {
        service.mouseDown = true;

        service.onMouseUp();

        expect(undoRedoStackServiceSpy.setIsToolInUse).toHaveBeenCalledWith(false);
    });

    it(' mouseUp should not make calls if mousDown is false', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = false;

        service.onMouseUp();

        expect(clearTimeoutSpy).not.toHaveBeenCalled();
        expect(drawServiceSpy.applyPreview).not.toHaveBeenCalled();
        expect(undoRedoStackServiceSpy.setIsToolInUse).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not set mouseCord if mousDown is false', () => {
        service.mouseCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseMove(mouseEvent);

        expect(service.mouseCoord).toEqual({ x: 0, y: 0 });
    });

    it(' onMouseMove should set mouseCord if mousDown is false', () => {
        service.mouseCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseMove(mouseEvent);

        expect(service.mouseCoord).toEqual({ x: 25, y: 25 });
    });

    it(' mouseLeave should call clearTimeout if mousDown is true', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = true;

        service.onMouseLeave();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it(' mouseLeave should not call clearTimeout if mousDown is false', () => {
        const clearTimeoutSpy = spyOn(global, 'clearTimeout');
        service.mouseDown = false;

        service.onMouseLeave();

        expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it(' mouseLeave should call applyPreview and setIsToolInUse if mousDown is true', () => {
        service.mouseDown = true;

        service.onMouseLeave();

        expect(drawServiceSpy.applyPreview).toHaveBeenCalled();
        expect(undoRedoStackServiceSpy.setIsToolInUse).toHaveBeenCalled();
    });

    it(' mouseEnter should call setTimeOut if mousDown is true', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseDown = true;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseEnter(mouseEvent);

        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it(' mouseEnter should not call setTimeOut if mousDown is false', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.mouseDown = false;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseEnter(mouseEvent);

        expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('drawSpray should not call setTimeout if timeoutId is undefined', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service.density = 0;

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('drawSpray should call setTimeout if timeoutId is not undefined', () => {
        service.density = 0;
        service.timeoutId = setTimeout(() => {}, 100);
        const setTimeoutSpy = spyOn(global, 'setTimeout');

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(setTimeoutSpy).toHaveBeenCalledWith(
            service.drawSpray,
            ONE_SECOND / service.sprayFrequency,
            service,
            service['drawingService'].previewCtx,
        );
    });

    it('drawSpray should not call getRandomNumber', () => {
        const getRandomNumberSpy = spyOn(service, 'getRandomNumber');
        service.density = 1;
        service.width = 2;
        service.mouseCoord = { x: 0, y: 0 };

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, Math.PI * 2);
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, service.width);
    });

    it('drawSpray should set ctx.globalAlpha', () => {
        const getRandomNumberSpy = spyOn(service, 'getRandomNumber');
        service.density = 1;
        service.mouseCoord = { x: 0, y: 0 };

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(previewCtxSpy.globalAlpha).toBeDefined();
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, Math.PI * 2);
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, service.width);
    });

    it('drawSpray should call Math.random', () => {
        const getRandomNumberSpy = spyOn(service, 'getRandomNumber');
        const randomSpy = spyOn(Math, 'random');
        service.density = 1;
        service.mouseCoord = { x: 0, y: 0 };

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(randomSpy).toHaveBeenCalled();
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, Math.PI * 2);
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, service.width);
    });

    it('drawSpray should set ctx.strokeStyle and ctx.fillStyle to colorSelectionService.primaryColor', () => {
        const getRandomNumberSpy = spyOn(service, 'getRandomNumber');
        service.density = 1;
        service.mouseCoord = { x: 0, y: 0 };
        service.colorSelectionService.primaryColor = '#ff0000';

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(previewCtxSpy.strokeStyle).toEqual('#ff0000');
        expect(previewCtxSpy.fillStyle).toEqual('#ff0000');
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, Math.PI * 2);
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, service.width);
    });

    it('drawSpray should call ctx fonctions to draw an arc', () => {
        const getRandomNumberSpy = spyOn(service, 'getRandomNumber');
        service.density = 1;
        service.mouseCoord = { x: 0, y: 0 };

        service.drawSpray(service, service['drawingService'].previewCtx);

        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.arc).toHaveBeenCalled();
        expect(previewCtxSpy.fill).toHaveBeenCalled();
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, Math.PI * 2);
        expect(getRandomNumberSpy).toHaveBeenCalledWith(0, service.width);
    });

    it('getRandomNumber should return random float within min and max range', () => {
        const minimum = 5;
        const maximum = 10;

        expect(service.getRandomNumber(minimum, maximum)).toBeGreaterThan(minimum);
        expect(service.getRandomNumber(minimum, maximum)).toBeGreaterThan(minimum);
        expect(service.getRandomNumber(minimum, maximum)).toBeGreaterThan(minimum);
        expect(service.getRandomNumber(minimum, maximum)).toBeGreaterThan(minimum);
        expect(service.getRandomNumber(minimum, maximum)).toBeLessThan(maximum);
        expect(service.getRandomNumber(minimum, maximum)).toBeLessThan(maximum);
        expect(service.getRandomNumber(minimum, maximum)).toBeLessThan(maximum);
        expect(service.getRandomNumber(minimum, maximum)).toBeLessThan(maximum);
    });

    it('should change width', () => {
        service.width = 0;
        service.changeWidth(1);
        expect(service.width).toBe(1);
    });

    it('should change dotWidth', () => {
        service.dotWidth = 0;
        service.changeDotWidth(1);
        expect(service.dotWidth).toBe(1);
    });

    it('should change sprayFrequency', () => {
        service.sprayFrequency = 0;
        service.changeSprayFrequency(1);
        expect(service.sprayFrequency).toBe(1);
    });

    it('reset should set drawingService.previewCtx.globalAlpha to 1', () => {
        service['drawingService'].previewCtx.globalAlpha = 0;
        service.reset();
        expect(service['drawingService'].previewCtx.globalAlpha).toBe(1);
    });
});
