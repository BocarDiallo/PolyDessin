import { TestBed } from '@angular/core/testing';
import { STAMPS } from '@app/classes/stamps';
import { MAX_ANGLE } from '@app/ressources/global-variables/global-variables';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from './stamp.service';
// tslint:disable: no-magic-numbers
// tslint:disable: no-string-literal
describe('StampService', () => {
    let service: StampService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let gridCanvasStub: HTMLCanvasElement;
    let previewCtxStub: CanvasRenderingContext2D;
    let baseCtxStub: CanvasRenderingContext2D;
    let colorPickerStub: ColorSelectionService;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'updateStack', 'setIsToolInUse', 'autoSave']);
        gridCanvasStub = document.createElement('canvas');
        drawingServiceSpy.gridCanvas = gridCanvasStub;
        colorPickerStub = new ColorSelectionService();
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorSelectionService, useValue: colorPickerStub },
            ],
        });
        service = TestBed.inject(StampService);

        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 50;
        previewCanvas.height = 50;
        previewCtxStub = previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.previewCtx = previewCtxStub;
        drawingServiceSpy.baseCtx = baseCtxStub;

        service['stampData'] = {
            type: 'stamp',
            color: '#000000',
            size: 1,
            position: { x: 0, y: 0 },
            currentStamp: STAMPS.ANGULAR,
            angle: 0,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setSize should change stampData.size', () => {
        service.setSize(10);
        expect(service['stampData'].size).toEqual(10);
    });

    it('setCurrentStamp should change stampData.currentStamp', () => {
        service.setCurrentStamp(STAMPS.DOCKER);
        expect(service['stampData'].currentStamp).toEqual(STAMPS.DOCKER);
    });

    it('setAngle should change stampData.angle', () => {
        service.setAngle(10);
        expect(service['stampData'].angle).toEqual(10);
    });

    it('getSize should return stampData.size', () => {
        service['stampData'].size = 10;
        expect(service.getSize()).toEqual(10);
    });

    it('setCursor should set the cursor at none', () => {
        service.setCursor();
        expect(drawingServiceSpy.gridCanvas.style.cursor).toEqual('none');
    });

    it('onMouseEnter should call setCursor', () => {
        const setCursorSpy = spyOn(service, 'setCursor');
        service.onMouseEnter();
        expect(setCursorSpy).toHaveBeenCalled();
    });

    it('should call preventDefault if key is Alt', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        const preventDefaultSpy = spyOn(keyboardEvent, 'preventDefault');
        service.onKeyDown(keyboardEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(service['isAltKeyDown']).toBeTrue();
    });

    it('isAltKey should stay false onKeyDown if key is not Alt', () => {
        service['isAltKeyDown'] = false;
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        service.onKeyDown(keyboardEvent);
        expect(service['isAltKeyDown']).toBeFalse();
    });

    it('isAltKey should be false onKeyUp if key is Alt', () => {
        const keyboardEvent = new KeyboardEvent('keyup', { key: 'Alt' });
        service.onKeyUp(keyboardEvent);
        expect(service['isAltKeyDown']).toBeFalse();
    });

    it('isAltKey should stay true onKeyUp if key is not Alt', () => {
        service['isAltKeyDown'] = true;
        const keyboardEvent = new KeyboardEvent('keyup', { key: 'a' });
        service.onKeyUp(keyboardEvent);
        expect(service['isAltKeyDown']).toBeTrue();
    });

    it('mouseMove should change currentMouseEvent', () => {
        service['currentMouseEvent'] = { x: 0, y: 0 } as MouseEvent;
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        service.onMouseMove(mouseEvent);
        expect(service['currentMouseEvent']).toEqual(mouseEvent);
    });

    it('MouseDown should call updateStampData', () => {
        const updateStampDataSpy = spyOn(service, 'updateStampData');
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(updateStampDataSpy).toHaveBeenCalledWith(mouseEvent);
    });

    it('printStamp should translate, rotate and scale context', () => {
        const translateSpy = spyOn(previewCtxStub, 'translate');
        const rotateSpy = spyOn(previewCtxStub, 'rotate');
        const scaleSpy = spyOn(previewCtxStub, 'scale');
        service.printStamp(previewCtxStub, service['stampData']);
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(scaleSpy).toHaveBeenCalled();
    });

    it('printStamp should put stampData.color as fillStyle', () => {
        service.printStamp(previewCtxStub, service['stampData']);
        expect(previewCtxStub.fillStyle).toEqual('#000000');
    });

    it('MouseWheel should call changeAngle and onMouseMove', () => {
        service['isAltKeyDown'] = false;
        const mouseWheel = { deltaY: 1 } as WheelEvent;
        const changeAngleSpy = spyOn(service, 'changeAngle');
        const onMouseMoveSpy = spyOn(service, 'onMouseMove');
        service.onWheelEvent(mouseWheel);
        expect(changeAngleSpy).toHaveBeenCalled();
        expect(onMouseMoveSpy).toHaveBeenCalled();
    });

    it('MouseWheel should have rotationStep of 1 if isAltKey is pressed', () => {
        service['isAltKeyDown'] = true;
        service['stampData'].angle = 40;
        const mouseWheel = { deltaY: 1 } as WheelEvent;
        const onMouseMoveSpy = spyOn(service, 'onMouseMove');

        service.onWheelEvent(mouseWheel);
        expect(onMouseMoveSpy).toHaveBeenCalled();
        expect(service['stampData'].angle).toEqual(39);
    });

    it('mouseLeave should call clearCanvas', () => {
        service.onMouseLeave();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('updateStampData should update date of stamp', () => {
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        service.updateStampData(mouseEvent);
        expect(service['stampData'].position).toEqual({ x: 25, y: 25 });
    });

    it('changeAngle should change angle when it negatif', () => {
        const newAngle = -5;
        service.changeAngle(newAngle);
        expect(service['stampData'].angle).toEqual(newAngle + MAX_ANGLE);
    });

    it('getAngle should return angleObservable', () => {
        expect(service.getAngle()).toEqual(service['angleObservable']);
    });
});
