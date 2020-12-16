import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionPoints, SELECTION_POINTS_NAMES } from '@app/classes/selection-points';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { DASH_LENGTH, DASH_SPACE_LENGTH, MouseButton } from '@app/ressources/global-variables/global-variables';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SquareService } from '@app/services/tools/square.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';
import { Subject } from 'rxjs';
import { MagnetismService } from './magnetism.service';
import { SelectionResizeService } from './selection-resize.service';
import { SelectionService } from './selection.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('SelectionService', () => {
    let service: SelectionService;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let moveServiceSpy: SpyObj<MoveService>;
    let magnetismServiceSpy: SpyObj<MagnetismService>;
    let selectionResizeServiceSpy: SpyObj<SelectionResizeService>;
    let previewCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let baseCtxSpy: SpyObj<CanvasRenderingContext2D>;
    let underlyingServiceSpy: SpyObj<SquareService>;
    let rotateServiceSpy: SpyObj<RotateService>;
    let clipboardServiceSpy: SpyObj<ClipboardService>;
    let obs: Subject<boolean>;
    let undoRedoStackServiceSpy: SpyObj<UndoRedoStackService>;

    let gridCanvasStub: HTMLCanvasElement;
    let selectionPoints: SelectionPoints;
    beforeEach(() => {
        obs = new Subject<boolean>();
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', [
            'magnetismXAxisChange',
            'magnetismYAxisChange',
            'onMouseMoveMagnetism',
            'magnetismCoordinateReference',
        ]);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'clearCanvas',
            'getCanvasData',
            'updateStack',
            'setIsToolInUse',
            'applyPreview',
            'autoSave',
            'drawImage',
        ]);
        clipboardServiceSpy = jasmine.createSpyObj('clipboardService', ['copy', 'resetSelectionPosition', 'getIsPasteAvailableSubject']);
        clipboardServiceSpy.isPasteAvailableSubject = obs;
        clipboardServiceSpy.selection = { startingPoint: { x: 0, y: 0 }, width: 10, height: 10 };

        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getCanvasData', 'applyPreview', 'autoSave']);
        moveServiceSpy = jasmine.createSpyObj('MoveService', [
            'printSelectionOnPreview',
            'onMouseDown',
            'onMouseMove',
            'onKeyDown',
            'onKeyUp',
            'snapOnGrid',
            'clearSelectionBackground',
            'initialize',
            'clearSelectionBackground',
            'resizeSelection',
        ]);
        selectionResizeServiceSpy = jasmine.createSpyObj('SelectionResizeService', [
            'drawSelectionOnPreviewCtx',
            'initialize',
            'setSelectionBeforeResize',
            'resizeSelection',
            'onKeyDown',
            'onKeyUp',
            '',
        ]);
        underlyingServiceSpy = jasmine.createSpyObj('SquareService', [
            'onMouseDown',
            'drawShape',
            'onMouseMove',
            'onKeyDown',
            'onKeyUp',
            'getFillStyle',
            'setFillStyle',
            'setFirstPoint',
            'setLastPoint',
            'setIsShiftDown',
            'changeWidth',
        ]);
        undoRedoStackServiceSpy = jasmine.createSpyObj('UndoRedoStackService', ['updateStack', 'setIsToolInUse']);
        underlyingServiceSpy.rectangleData = {
            type: 'rectangle',
            primaryColor: 'red',
            secondaryColor: 'blue',
            height: 0,
            width: 0,
            topLeftPoint: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.FILL_AND_BORDER,
            isShiftDown: false,
            lineWidth: 1,
        };
        const WIDTH = 100;
        const HEIGHT = 100;
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        gridCanvasStub = canvas as HTMLCanvasElement;
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['setLineDash', 'fillRect', 'save', 'restore']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);
        rotateServiceSpy = jasmine.createSpyObj('RotateService', [
            'restoreSelection',
            'onKeyDown',
            'onKeyUp',
            'rotatePreviewCanvas',
            'onMouseWheel',
            'initialize',
            'calculateCenter',
            'onWheelEvent',
        ]);
        drawingServiceSpy.previewCtx = previewCtxSpy;
        drawingServiceSpy.baseCtx = baseCtxSpy;
        drawingServiceSpy.gridCanvas = gridCanvasStub;

        selectionPoints = {
            LEFT_X: 0,
            TOP_Y: 0,
            MIDDLE_X: 50,
            MIDDLE_Y: 50,
            RIGHT_X: 100,
            BOTTOM_Y: 100,
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MoveService, useValue: moveServiceSpy },
                { provide: RotateService, useValue: rotateServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
                { provide: SelectionResizeService, useValue: selectionResizeServiceSpy },
                { provide: UndoRedoStackService, useValue: undoRedoStackServiceSpy },
            ],
        });
        service = TestBed.inject(SelectionService);

        service.underlyingService = underlyingServiceSpy;
        service.selection.height = 0;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initialize should set drawingService.previewCtx properties', () => {
        service.initialize();
        expect(previewCtxSpy.lineWidth).toEqual(1);
        expect(previewCtxSpy.strokeStyle).toEqual('black');
        expect(previewCtxSpy.setLineDash).toHaveBeenCalledWith([DASH_LENGTH, DASH_SPACE_LENGTH]);
    });

    it('onMouseDown should not call underliyingService.onMouseDown or moveService.onMouseDown if right click', () => {
        const mouseEvent = {
            button: MouseButton.RIGHT,
        } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(underlyingServiceSpy.onMouseDown).not.toHaveBeenCalled();
        expect(moveServiceSpy.onMouseDown).not.toHaveBeenCalled();
    });

    it('onMouseDown should call underliyingService.onMouseDown if click is not in selection', () => {
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        const isInSelectionSpy = spyOn(service, 'isInSelection');
        isInSelectionSpy.and.returnValue(false);
        service.moveService.isTransformationOver = true;

        service.onMouseDown(mouseEvent);

        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(service.selection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(underlyingServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('onMouseDown should set isResizing to true if cursor is on selection point', () => {
        const checkIfCursorIsOnSelectionPointSpy = spyOn(service, 'checkIfCursorIsOnSelectionPoint').and.returnValue(
            SELECTION_POINTS_NAMES.BOTTOM_LEFT,
        );
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(checkIfCursorIsOnSelectionPointSpy).toHaveBeenCalled();
        expect(service.isResizing).toBe(true);
    });

    it('onMouseUp should call all the methods to resize selection box if currently resizing', () => {
        const setSelectionCornersSpy = spyOn(service, 'setSelectionCorners');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.isResizing = true;
        service.onMouseUp(mouseEvent);
        expect(setSelectionCornersSpy).toHaveBeenCalled();
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
        expect(service.isResizing).toBe(false);
    });

    it('onMouseDown should call applypreview if click is not in selection and moveService is currently in transformation', () => {
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        const isInSelectionSpy = spyOn(service, 'isInSelection');
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        isInSelectionSpy.and.returnValue(false);
        service.moveService.isTransformationOver = false;

        service.onMouseDown(mouseEvent);

        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(moveServiceSpy.isTransformationOver).toBeTrue();
        expect(moveServiceSpy.printSelectionOnPreview).toHaveBeenCalled();
        expect(applyPreviewSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call moveService.onMouseDown if click is in selection', () => {
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        const isInSelectionSpy = spyOn(service, 'isInSelection');
        isInSelectionSpy.and.returnValue(true);

        service.onMouseDown(mouseEvent);
        expect(isInSelectionSpy).toHaveBeenCalled();
        expect(service.transormation).toEqual('move');
        expect(moveServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('onMouseUp should call getPositionFromMouse and underlyingService.drawShape', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;

        service.onMouseUp({} as MouseEvent);

        expect(getPositionFromMouseSpy).toHaveBeenCalledWith({} as MouseEvent);
        expect(underlyingServiceSpy.drawShape).toHaveBeenCalledWith(previewCtxSpy);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call drawingService.clearCanvas', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;

        service.onMouseUp({} as MouseEvent);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should not change underlyingService.fillStyle', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;
        underlyingServiceSpy.rectangleData.fillStyle = FILL_STYLES.BORDER;
        // tslint:disable-next-line: only-arrow-functions
        underlyingServiceSpy.setFillStyle.and.callFake(function (fillStyle: number): void {
            underlyingServiceSpy.rectangleData.fillStyle = fillStyle;
        });
        // tslint:disable-next-line: only-arrow-functions
        underlyingServiceSpy.getFillStyle.and.callFake(function (): number {
            return underlyingServiceSpy.rectangleData.fillStyle;
        });

        service.onMouseUp({} as MouseEvent);

        expect(underlyingServiceSpy.rectangleData.fillStyle).toEqual(FILL_STYLES.BORDER);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set isNewSelection to false', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;

        service.onMouseUp({} as MouseEvent);

        expect(service.isNewSelection).toBeFalse();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call setInitialSelection and setSelectionData if selection is not empty', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 0, y: 0 });
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = true;
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');

        service.onMouseUp({} as MouseEvent);

        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set transformation to empty string if transformation is move', () => {
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isNewSelection = false;
        service.transormation = 'move';

        service.onMouseUp({} as MouseEvent);

        expect(service.transormation).toEqual('');
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call strokeSelection and setSelectionPoint', () => {
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');

        service.isNewSelection = false;

        service.onMouseUp({} as MouseEvent);

        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call underlyingService.onMouseMove if isNewSelection', () => {
        service.isNewSelection = true;

        service.onMouseMove({} as MouseEvent);

        expect(underlyingServiceSpy.onMouseMove).toHaveBeenCalledWith({} as MouseEvent);
    });

    it('onMouseMove should call moveService.onMouseMove if transformation is move', () => {
        service.isNewSelection = false;
        service.transormation = 'move';

        service.onMouseMove({} as MouseEvent);

        expect(moveServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it('onMouseMove should not call moveService.onMouseMove or underlyingService.onMouseMove', () => {
        service.isNewSelection = false;
        service.transormation = '';

        service.onMouseMove({} as MouseEvent);

        expect(underlyingServiceSpy.onMouseMove).not.toHaveBeenCalled();
        expect(moveServiceSpy.onMouseMove).not.toHaveBeenCalled();
    });

    it('onKeyDown should call moveService.onKeyDown if selection is not empty', () => {
        service.selection = { startingPoint: { x: 0, y: 0 }, width: 10, height: 10 };

        service.onKeyDown({} as KeyboardEvent);

        expect(moveServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('onKeyDown should call underlyingService.onKeyDown if isNewSelection', () => {
        service.isNewSelection = true;

        service.onKeyDown({} as KeyboardEvent);

        expect(underlyingServiceSpy.onKeyDown).toHaveBeenCalledWith({} as KeyboardEvent);
    });

    it('onKeyDown should set isEscapeKeyPressed to true and call reset if EscapeKey pressed', () => {
        const resetSpy = spyOn(service, 'reset');
        const event = {
            key: 'Escape',
        } as KeyboardEvent;

        service.onKeyDown(event);

        expect(service.isEscapeKeyPressed).toBeTrue();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('onKeyDown should set isShiftKeyDown to true and call reset if Shift is pressed', () => {
        const event = {
            key: 'Shift',
        } as KeyboardEvent;

        service.onKeyDown(event);

        expect(service.isShiftKeyDown).toBeTrue();
    });

    it('onKeyDown should call apply preview if key is delete', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        const event = {
            key: 'Delete',
        } as KeyboardEvent;

        service.onKeyDown(event);

        expect(applyPreviewSpy).toHaveBeenCalled();
    });

    it('selectAll should call setInitialSelection, setSelectionData and setSelectionPoint', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('selectAll should set selection to canvas width and canvas height', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(service.selection).toEqual({
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        });

        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('selectAll should call clear canvas', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('selectAll should set attributes for underlyingService', () => {
        const setInitialSelectionSpy = spyOn(service, 'setSelection');
        const setSelectionDataSpy = spyOn(service, 'setSelectionData');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service['drawingService'].canvas = document.createElement('canvas');
        service['drawingService'].canvas.width = 10;
        service['drawingService'].canvas.height = 10;
        underlyingServiceSpy.drawShape.and.returnValue({ startingPoint: { x: 0, y: 0 }, width: 10, height: 10 });

        service.selectAll();

        expect(underlyingServiceSpy.setFirstPoint).toHaveBeenCalledWith({ x: 0, y: 0 });
        expect(underlyingServiceSpy.setLastPoint).toHaveBeenCalledWith({ x: 10, y: 10 });
        expect(underlyingServiceSpy.setFillStyle).toHaveBeenCalledWith(FILL_STYLES.DASHED);
        expect(setInitialSelectionSpy).toHaveBeenCalled();
        expect(setSelectionDataSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp  should call moveService.onKeyUp and setSelectionPoint', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isShiftKeyDown = true;

        service.onKeyUp({} as KeyboardEvent);

        expect(moveServiceSpy.onKeyUp).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp  should call underlyingService.onKeyUp and strokeSelection if isShiftKeyDown', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        service.isShiftKeyDown = false;

        service.onKeyUp({} as KeyboardEvent);

        expect(underlyingServiceSpy.onKeyUp).toHaveBeenCalled();
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp should set underlyingService.isShiftKeyDown to false and isShiftKeyDown to false if shift key up', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isShiftKeyDown = true;
        service.underlyingService.setIsShiftDown(true);

        service.onKeyUp({ key: 'Shift' } as KeyboardEvent);

        expect(service.isShiftKeyDown).toBeFalse();
        expect(underlyingServiceSpy.setIsShiftDown).toHaveBeenCalledWith(false);
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('onKeyUp should set underlyingService.isShiftKeyDown to false and isShiftKeyDown to false if shift key up', () => {
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.isShiftKeyDown = true;
        service.isNewSelection = true;

        service.onKeyUp({ key: 'Shift' } as KeyboardEvent);

        expect(service.underlyingService.onKeyUp).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('isInSelection should return false when selection is empty', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 1, y: 2 });

        const result = service.isInSelection({} as MouseEvent);

        expect(result).toBeFalse();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('isInSelection should return false when mouseEvent is out of selection', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 14, y: 14 });

        service.selection = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        const result = service.isInSelection({} as MouseEvent);

        expect(result).toBeFalse();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('isInSelection should return true when mouseEvent is in of selection', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        getPositionFromMouseSpy.and.returnValue({ x: 1, y: 2 });

        service.selection = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        const result = service.isInSelection({} as MouseEvent);

        expect(result).toBeTrue();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('reset should call previewCtx.setLineDash and drawingService.clearCanvas', () => {
        service.reset();

        expect(previewCtxSpy.setLineDash).toHaveBeenCalledWith([0]);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
    });

    it('reset should reset internal attributes', () => {
        service.reset();

        expect(service.selection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(service.mouseDown).toBeFalse();
        expect(service.transormation).toEqual('');
    });

    it('reset should reset moveService attributes attributes', () => {
        service.reset();

        expect(moveServiceSpy.initialSelection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(moveServiceSpy.isTransformationOver).toBeTrue();
    });

    it('reset should call moveService.printSelectionOnPreview and applyPreview', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');

        service.selection = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        service.reset();

        expect(moveServiceSpy.printSelectionOnPreview).toHaveBeenCalled();
        expect(applyPreviewSpy).toHaveBeenCalled();
    });

    it('setInitialSelection should set initial selection', () => {
        const selection: SelectionBox = {
            startingPoint: { x: 0, y: 0 },
            width: 10,
            height: 10,
        };

        service.setSelection(service.initialSelection, selection);

        expect(service.initialSelection).toEqual(selection);
    });

    it('applyPreview should update selection data', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');

        service.applyPreview();

        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('applyPreview should draw on baseCtx', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');

        service.applyPreview();

        expect(drawingServiceSpy.applyPreview).toHaveBeenCalled();
        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('applyPreview should get canvas and save it in canvasData', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');
        const canvasData: ImageData = { data: new Uint8ClampedArray([1, 1, 1, 1, 0, 0, 0, 1]), height: 1, width: 2 };
        drawingServiceSpy.getCanvasData.and.returnValue(canvasData);

        service.applyPreview();

        expect(drawingServiceSpy.getCanvasData).toHaveBeenCalled();
        expect(service.canvasData).toEqual(canvasData);
        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('applyPreview should update undo stack with selection data', () => {
        const updateSelectionDataSpy = spyOn(service, 'updateSelectionData');

        service.applyPreview();

        expect(undoRedoStackServiceSpy.updateStack).toHaveBeenCalledWith(service.selectionData);
        expect(updateSelectionDataSpy).toHaveBeenCalled();
    });

    it('updateSelectionData should set selectionData', () => {
        const imageData: ImageData = { data: new Uint8ClampedArray([1, 1, 1, 1, 0, 0, 0, 1]), height: 1, width: 2 };
        service.selectionData = { type: '', imageData };
        const canvasData: ImageData = { data: new Uint8ClampedArray([2, 2, 2, 2, 2, 2, 2, 1]), height: 1, width: 2 };
        service.canvasData = canvasData;

        service.updateSelectionData();

        expect(service.selectionData).toEqual({
            type: 'selection',
            imageData: canvasData,
        });
    });

    it('setSelectionPoint should not draw blue squares if selection is empty', () => {
        service.setSelectionPoint();
        expect(previewCtxSpy.fillRect).not.toHaveBeenCalled();
    });

    it('should set grid spacing on setGridSpacing call', () => {
        service.squareSize = 5;
        service.setGridSpacing(10);
        expect(service.squareSize).toEqual(10);
    });

    it('should set magnetism on enableMagnetism call', () => {
        service.isMagnetism = false;
        service.enableMagnetism(true);
        expect(service.isMagnetism).toEqual(true);
    });

    it('should call onMouseMoveMagnetism if magnetism is enabled and the transformation is move', () => {
        const mouveMoveMagnetismSpy = spyOn(service, 'onMouseMoveMagnetism');
        service.isNewSelection = false;
        service.transormation = 'move';
        service.isMagnetism = true;
        service.onMouseMove({} as MouseEvent);
        expect(mouveMoveMagnetismSpy).toHaveBeenCalled();
    });

    it('should call the method in magnetismService on onMouseMoveMagnetism call', () => {
        service.onMouseMoveMagnetism(2, 2);
        expect(magnetismServiceSpy.magnetismXAxisChange).toHaveBeenCalled();
        expect(magnetismServiceSpy.magnetismYAxisChange).toHaveBeenCalled();
        expect(magnetismServiceSpy.onMouseMoveMagnetism).toHaveBeenCalled();
    });

    it('should return false if coordinates are not on grid', () => {
        service.squareSize = 3;
        expect(service.isSnappedOnGrid({ x: 2, y: 2 })).toBeFalsy();
    });

    it('should return true if coordinates are on grid', () => {
        service.squareSize = 2;
        expect(service.isSnappedOnGrid({ x: 4, y: 4 })).toBeTruthy();
    });

    it('onKeyDown should call snap on grid if it is not snapped', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.isMagnetism = true;
        const isSnappedOnGridSpy = spyOn(service, 'isSnappedOnGrid').and.returnValue(false);
        service.onKeyDown({} as KeyboardEvent);

        expect(isSnappedOnGridSpy).toHaveBeenCalled();
        expect(moveServiceSpy.snapOnGrid).toHaveBeenCalled();
    });

    it('cut should call applyPreview', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        const applyPreviewSpy = spyOn(service, 'applyPreview');

        service.cut();

        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should call copy and resetSlectionPosition of clipboardService', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.selectionImage = document.createElement('canvas');
        service.rotateService.angle = 3;
        service.selectionContour = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.cut();

        expect(clipboardServiceSpy.copy).toHaveBeenCalledWith(
            { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 },
            service.selectionImage,
            service.rotateService.angle,
        );
        expect(clipboardServiceSpy.resetSelectionPosition).toHaveBeenCalledWith(service.selectionContour);
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should not call copy and resetSlectionPosition of clipboardService if selection is empty', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 0, height: 0 };
        service.selectionImage = document.createElement('canvas');
        service.rotateService.angle = 3;
        service.selectionContour = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.cut();

        expect(clipboardServiceSpy.copy).not.toHaveBeenCalled();
        expect(clipboardServiceSpy.resetSelectionPosition).not.toHaveBeenCalled();
    });

    it('cut should set clipboardService.selectionType', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        clipboardServiceSpy.selectionType = 0;
        service.selectionType = 3;

        service.cut();

        expect(clipboardServiceSpy.selectionType).toEqual(service.selectionType);
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should call moveService.clearSelectionBackground', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.cut();

        expect(moveServiceSpy.clearSelectionBackground).toHaveBeenCalled();
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should reset selection', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.cut();

        expect(service.selection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should set isSelectionEmptySubject to true using next', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        const nextSpy = spyOn(service.isSelectionEmptySubject, 'next');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.cut();

        expect(nextSpy).toHaveBeenCalledWith(true);
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should set moveService.isTransformationOver to true', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.moveService.isTransformationOver = false;

        service.cut();

        expect(service.moveService.isTransformationOver).toEqual(true);
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('cut should set isSelectionOver to true', () => {
        const applyPreviewSpy = spyOn(service, 'applyPreview');
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.isSelectionOver = false;

        service.cut();

        expect(service.isSelectionOver).toEqual(true);
        expect(applyPreviewSpy).toHaveBeenCalledWith();
    });

    it('copy should call copy and resetSlectionPosition of clipboardService', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.selectionImage = document.createElement('canvas');
        service.rotateService.angle = 3;
        service.selectionContour = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.copy();

        expect(clipboardServiceSpy.copy).toHaveBeenCalledWith(
            { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 },
            service.selectionImage,
            service.rotateService.angle,
        );
        expect(clipboardServiceSpy.resetSelectionPosition).toHaveBeenCalledWith(service.selectionContour);
    });

    it('copy should not call copy and resetSlectionPosition of clipboardService if selection is empty', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 0, height: 0 };
        service.selectionImage = document.createElement('canvas');
        service.rotateService.angle = 3;
        service.selectionContour = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.copy();

        expect(clipboardServiceSpy.copy).not.toHaveBeenCalled();
        expect(clipboardServiceSpy.resetSelectionPosition).not.toHaveBeenCalled();
    });

    it('copy should set clipboardService.selectionType', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        clipboardServiceSpy.selectionType = 0;
        service.selectionType = 3;

        service.copy();

        expect(clipboardServiceSpy.selectionType).toEqual(service.selectionType);
    });

    it('copy should call moveService.printSelectionOnPreview', () => {
        service.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };

        service.copy();

        expect(moveServiceSpy.printSelectionOnPreview).toHaveBeenCalled();
    });

    it('paste should call setSelection, updateSelectionCorners, setSelectionImage, strokeSelection and setSelectionPoint', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should call rotateService.initialize', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(rotateServiceSpy.initialize).toHaveBeenCalledWith(service.selection, service.selectionImage);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should call moveService.initialize', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(moveServiceSpy.initialize).toHaveBeenCalledWith(service.selection, service.selectionImage);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should set isSelectionEmptySubject using next', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        const nextSpy = spyOn(service.isSelectionEmptySubject, 'next');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(nextSpy).toHaveBeenCalledWith(false);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should set rotateService.angle', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(service.rotateService.angle).toEqual(service.clipboardService.angle);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should set rotateService.intialSelection', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(service.rotateService.initialSelection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should set moveService.intialSelection', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(service.moveService.initialSelection).toEqual({ startingPoint: { x: 0, y: 0 }, width: 0, height: 0 });
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should set isSelectionOver to false', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(service.isSelectionOver).toEqual(false);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should set moveService.isTransformationOver to false', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(service.moveService.isTransformationOver).toEqual(false);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('paste should call moveService.printSelectionOnPreview()', () => {
        const setSelectionSpy = spyOn(service, 'setSelection');
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const setSelectionImageSpy = spyOn(service, 'setSelectionImage');
        const strokeSelectionSpy = spyOn(service, 'strokeSelection');
        const setSelectionPointSpy = spyOn(service, 'setSelectionPoint');
        service.clipboardService.selection = { startingPoint: { x: 2, y: 3 }, width: 10, height: 10 };
        service.clipboardService.selectionType = service.selectionType;

        service.paste();

        expect(moveServiceSpy.printSelectionOnPreview).toHaveBeenCalled();
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, service.clipboardService.selection);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
        expect(setSelectionImageSpy).toHaveBeenCalledWith(service.clipboardService.clipboardCanvas);
        expect(strokeSelectionSpy).toHaveBeenCalled();
        expect(setSelectionPointSpy).toHaveBeenCalled();
    });

    it('setSelectionPoint should call restore after canvas modifications', () => {
        service.selection.height = 1;
        service.selection.width = 1;
        service.setSelectionPoint();
        expect(drawingServiceSpy.previewCtx.restore).toHaveBeenCalled();
    });

    it('should return top left point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 0, y: 0 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.TOP_LEFT);
    });

    it('should return middle top point', () => {
        service.selectionPoints = selectionPoints;

        const mouseCoordinates = { x: 50, y: 0 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.TOP_MIDDLE);
    });

    it('should return top right point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 100, y: 0 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.TOP_RIGHT);
    });

    it('should return middle left point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 0, y: 50 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.MIDDLE_LEFT);
    });

    it('should return middle right point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 100, y: 50 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.MIDDLE_RIGHT);
    });

    it('should return bottom left point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 0, y: 100 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.BOTTOM_LEFT);
    });

    it('should return bottom middle point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 50, y: 100 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.BOTTOM_MIDDLE);
    });

    it('should return bottom right point', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 100, y: 100 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.BOTTOM_RIGHT);
    });

    it('should return no point if cursor on left side but outside of point coordinates', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 0, y: 10 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.NO_POINTS);
    });

    it('should return no point if cursor on middle but outside of point coordinates', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 50, y: 10 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.NO_POINTS);
    });

    it('should return no point if cursor on right side but outside of point coordinates', () => {
        service.selectionPoints = selectionPoints;
        const mouseCoordinates = { x: 100, y: 10 };
        const result = service.checkIfCursorIsOnSelectionPoint(mouseCoordinates);
        expect(result).toEqual(SELECTION_POINTS_NAMES.NO_POINTS);
    });

    it('should adjust angle if new angle is greater than 360 degrees', () => {
        const newAngle = 365;
        const result = service.updateAngle(newAngle);
        expect(result).toEqual(5);
    });

    it('should adjust angle if new angle is less than 0 degrees', () => {
        const newAngle = -5;
        const result = service.updateAngle(newAngle);
        expect(result).toEqual(355);
    });

    it('cursor should not be reset if it is still on selection point', () => {
        const setCursorSpy = spyOn(service, 'setCursor');
        const checkIfCursorIsOnSelectionPointSpy = spyOn(service, 'checkIfCursorIsOnSelectionPoint').and.returnValue(
            SELECTION_POINTS_NAMES.BOTTOM_LEFT,
        );
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseMove(mouseEvent);
        expect(checkIfCursorIsOnSelectionPointSpy).toHaveBeenCalled();
        expect(setCursorSpy).not.toHaveBeenCalled();
    });

    it('resizeSelection should be called if resizing while moving cursor', () => {
        const setCursorSpy = spyOn(service, 'setCursor');
        const checkIfCursorIsOnSelectionPointSpy = spyOn(service, 'checkIfCursorIsOnSelectionPoint').and.returnValue(
            SELECTION_POINTS_NAMES.BOTTOM_LEFT,
        );
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.onMouseMove(mouseEvent);
        expect(checkIfCursorIsOnSelectionPointSpy).toHaveBeenCalled();
        expect(setCursorSpy).not.toHaveBeenCalled();
    });

    it('cursor should not be reset if it is still on selection point', () => {
        const setCursorSpy = spyOn(service, 'setCursor');
        const setSelectionSpy = spyOn(service, 'setSelection');
        const checkIfCursorIsOnSelectionPointSpy = spyOn(service, 'checkIfCursorIsOnSelectionPoint').and.returnValue(
            SELECTION_POINTS_NAMES.BOTTOM_LEFT,
        );
        selectionResizeServiceSpy.resizeSelection.and.returnValue({
            startingPoint: { x: 0, y: 0 },
            width: 1,
            height: 1,
        });
        const mouseEvent = {
            button: MouseButton.LEFT,
        } as MouseEvent;
        service.isResizing = true;
        service.onMouseMove(mouseEvent);
        expect(selectionResizeServiceSpy.initialize).toHaveBeenCalled();
        expect(setSelectionSpy).toHaveBeenCalled();
        expect(checkIfCursorIsOnSelectionPointSpy).toHaveBeenCalled();
        expect(setCursorSpy).not.toHaveBeenCalled();
    });

    it('ctrlKeyDown should be called if key down is a control key', () => {
        const ctrlKeyDownSpy = spyOn(service, 'ctrlKeyDown');
        const event = {
            ctrlKey: true,
        } as KeyboardEvent;
        service.onKeyDown(event);
        expect(ctrlKeyDownSpy).toHaveBeenCalled();
    });

    it('should call cut if control key is x', () => {
        const cutSpy = spyOn(service, 'cut');
        const event = {
            key: 'x',
        } as KeyboardEvent;
        service.ctrlKeyDown(event);
        expect(cutSpy).toHaveBeenCalled();
    });

    it('should call copy if control key is c', () => {
        const copySpy = spyOn(service, 'copy');
        const event = {
            key: 'c',
        } as KeyboardEvent;
        service.ctrlKeyDown(event);
        expect(copySpy).toHaveBeenCalled();
    });

    it('should call paste if control key is v', () => {
        const pasteSpy = spyOn(service, 'paste');
        const event = {
            key: 'v',
        } as KeyboardEvent;
        service.ctrlKeyDown(event);
        expect(pasteSpy).toHaveBeenCalled();
    });

    it('if mouseWheel is true when calling isInSelection, should call calculateCenter', () => {
        rotateServiceSpy.calculateCenter.and.returnValue({ x: 1, y: 1 });
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        rotateServiceSpy.mouseWheel = true;
        service.isInSelection(mouseEvent);
        expect(rotateServiceSpy.calculateCenter).toHaveBeenCalled();
    });

    it('setSelectionImage should change image width and height', () => {
        service.setSelectionImage(gridCanvasStub);
        expect(service.selectionImage.width).toEqual(100);
        expect(service.selectionImage.height).toEqual(100);
    });

    it('onWheelEvent should update selection contour if selection is not over', () => {
        const updateSelectionCornersSpy = spyOn(service, 'updateSelectionCorners');
        const mouseWheelEvent = {
            deltaY: 101,
        } as WheelEvent;
        service.isSelectionOver = false;
        service.onWheelEvent(mouseWheelEvent);
        expect(updateSelectionCornersSpy).toHaveBeenCalled();
    });

    it('test', () => {
        // tslint:disable-next-line: no-shadowed-variable
        let obs: Subject<boolean>;
        obs = new Subject<boolean>();
        const getIsSelectionEmptySubjectSpy = spyOn(service, 'getIsSelectionEmptySubject');
        getIsSelectionEmptySubjectSpy.and.callThrough();
        const result = service.getIsSelectionEmptySubject();
        expect(result).toEqual(obs.asObservable());
    });
});
