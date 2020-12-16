import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { SELECTION_POINTS_NAMES } from '@app/classes/selection-points';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionResizeService } from '@app/services/tools/selection-services/selection-resize.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import SpyObj = jasmine.SpyObj;
// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
// tslint:disable: no-magic-numbers
// tslint:disable: no-any

describe('SelectionResizeService', () => {
    let service: SelectionResizeService;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let moveServiceSpy: SpyObj<MoveService>;
    let rotateServiceSpy: SpyObj<RotateService>;
    let previewCtxSpy: SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', [
            'drawImage',
            'scale',
            'fillRect',
            'save',
            'restore',
            'translate',
            'rotate',
        ]);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'setIsToolInUse', 'applyPreview']);
        moveServiceSpy = jasmine.createSpyObj('MoveService', ['clearSelectionBackground']);
        rotateServiceSpy = jasmine.createSpyObj('RotateService', ['rotatePreviewCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MoveService, useValue: moveServiceSpy },
                { provide: RotateService, useValue: rotateServiceSpy },
            ],
        });
        service = TestBed.inject(SelectionResizeService);

        drawingServiceSpy.previewCtx = previewCtxSpy;
        service['selection'] = { startingPoint: { x: 0, y: 0 }, width: 1, height: 1 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize service', () => {
        const selection: SelectionBox = { startingPoint: { x: 3, y: 3 }, width: 2, height: 1 };
        const selectionImage: HTMLCanvasElement = document.createElement('canvas');
        const selectionImageCtx: CanvasRenderingContext2D = selectionImage.getContext('2d') as CanvasRenderingContext2D;
        service.initialize(selection, selectionImage);

        expect(service['selection']).toEqual(selection);
        expect(service['selectionImage']).toEqual(selectionImage);
        expect(service['selectionImageCtx']).toEqual(selectionImageCtx);
    });

    it('should set selectionBeforeResize equal to current selection', () => {
        const selection: SelectionBox = { startingPoint: { x: 3, y: 3 }, width: 2, height: 1 };

        service.setSelectionBeforeResize(selection);
        expect(service['selectionBeforeResize'].startingPoint.x).toEqual(selection.startingPoint.x);
        expect(service['selectionBeforeResize'].startingPoint.y).toEqual(selection.startingPoint.y);
        expect(service['selectionBeforeResize'].width).toEqual(selection.width);
        expect(service['selectionBeforeResize'].height).toEqual(selection.height);
    });

    it('onKeyDown should set isShiftDown to true if key is shift', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Shift' });
        service.isShiftKeyDown = false;
        service.onKeyDown(keyboardEvent);
        expect(service.isShiftKeyDown).toEqual(true);
    });

    it('onKeyDown should not set isShiftDown to true if key is not shift', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Control' });
        service.isShiftKeyDown = false;
        service.onKeyDown(keyboardEvent);
        expect(service.isShiftKeyDown).toEqual(false);
    });

    it('onKeyUp should set isShiftDown to false if key is shift', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Shift' });
        service.isShiftKeyDown = true;
        service.onKeyUp(keyboardEvent);
        expect(service.isShiftKeyDown).toEqual(false);
    });

    it('onKeyUp should not set isShiftDown to false if key is not shift', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Control' });
        service.isShiftKeyDown = true;
        service.onKeyUp(keyboardEvent);
        expect(service.isShiftKeyDown).toEqual(true);
    });

    it('printselectionOnBaseCtx should call applyPreview from drawing service', () => {
        service.printSelectionOnBaseCtx();
        expect(drawingServiceSpy.applyPreview).toHaveBeenCalled();
    });

    it('calling resizeSelection with top left point should call resizeTopLeft', () => {
        const resizeTopLeftSpy = spyOn(service, 'resizeTopLeft');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.TOP_LEFT;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeTopLeftSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with top middle point should call resizeTopMiddle', () => {
        const resizeTopMiddleSpy = spyOn(service, 'resizeTopMiddle');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.TOP_MIDDLE;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeTopMiddleSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with top right point should call resizeTopRight', () => {
        const resizeTopRightSpy = spyOn(service, 'resizeTopRight');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.TOP_RIGHT;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeTopRightSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with middle left point should call resizeLeftMiddle', () => {
        const resizeLeftMiddleSpy = spyOn(service, 'resizeLeftMiddle');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.MIDDLE_LEFT;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeLeftMiddleSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with middle right point should call resizeRightMiddle', () => {
        const resizeRightMiddleSpy = spyOn(service, 'resizeRightMiddle');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.MIDDLE_RIGHT;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeRightMiddleSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with bottom left point should call resizeBottomLeft', () => {
        const resizeBottomLeftSpy = spyOn(service, 'resizeBottomLeft');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.BOTTOM_LEFT;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeBottomLeftSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with bottom middle point should call resizeBottomMiddle', () => {
        const resizeBottomMiddleSpy = spyOn(service, 'resizeBottomMiddle');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.BOTTOM_MIDDLE;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeBottomMiddleSpy).toHaveBeenCalled();
    });

    it('calling resizeSelection with bottom right point should call resizeBottomRight', () => {
        const resizeBottomRightSpy = spyOn(service, 'resizeBottomRight');
        const mouseCoordinates = { x: 1, y: 1 };
        const selectionPoint = SELECTION_POINTS_NAMES.BOTTOM_RIGHT;
        service.resizeSelection(mouseCoordinates, selectionPoint);
        expect(resizeBottomRightSpy).toHaveBeenCalled();
    });

    it('resizeTopMiddle should change startingpoint.y to vertical mouse position', () => {
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeTopMiddle(mouseCoordinates);
        expect(service.selection.startingPoint.y).toEqual(mouseCoordinates.y);
    });

    it('resizeTopMiddle should not resize if shift is pressed', () => {
        service.selection.startingPoint.y = 1;
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = true;
        service.resizeTopMiddle(mouseCoordinates);
        expect(service.selection.startingPoint.y).toEqual(5);
    });

    it('resizeBottomMiddle should not change selection width (vertical resize)', () => {
        service.selection.width = 2;
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeBottomMiddle(mouseCoordinates);
        expect(service.selection.width).toEqual(2);
    });

    it('resizeBottomMiddle should not resize if shift is pressed', () => {
        service.selection.width = 2;
        service.isShiftKeyDown = true;
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeBottomMiddle(mouseCoordinates);
        expect(service.selection.width).toEqual(2);
    });

    it('resizeLeftMiddle should not change selection height (horizontal resize)', () => {
        service.selection.height = 2;
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeLeftMiddle(mouseCoordinates);
        expect(service.selection.height).toEqual(2);
    });

    it('resizeLeftMiddle should not resize if shift is pressed', () => {
        service.selection.width = 2;
        service.isShiftKeyDown = true;
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeLeftMiddle(mouseCoordinates);
        expect(service.selection.width).toEqual(2);
    });

    it('resizeRightMiddle should not change selection height (horizontal resize)', () => {
        service.selection.height = 2;
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeRightMiddle(mouseCoordinates);
        expect(service.selection.height).toEqual(2);
    });

    it('resizeRightMiddle should not resize if shift is pressed', () => {
        service.selection.width = 2;
        service.isShiftKeyDown = true;
        const mouseCoordinates = { x: 5, y: 5 };
        service.resizeRightMiddle(mouseCoordinates);
        expect(service.selection.width).toEqual(2);
    });

    it('resizeBottomLeft should call adjustSelectionAspectRatio if shift key is down', () => {
        const adjustSelectionAspectRatioSpy = spyOn(service, 'adjustSelectionAspectRatio');
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = true;
        service.resizeBottomLeft(mouseCoordinates);
        expect(adjustSelectionAspectRatioSpy).toHaveBeenCalled();
    });

    it('resizeBottomLeft should move the starting point horizontally to follow mouse position if shift is not pressed', () => {
        service.selection.startingPoint.x = 1;
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = false;
        service.resizeBottomLeft(mouseCoordinates);
        expect(service.selection.startingPoint.x).toEqual(mouseCoordinates.x);
    });

    it('resizeTopRight should call adjustSelectionAspectRatio if shift key is down', () => {
        const adjustSelectionAspectRatioSpy = spyOn(service, 'adjustSelectionAspectRatio');
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = true;
        service.resizeTopRight(mouseCoordinates);
        expect(adjustSelectionAspectRatioSpy).toHaveBeenCalled();
    });

    it('resizeTopRight should move the starting point vertically to follow mouse position if shift is not pressed', () => {
        service.selection.startingPoint.y = 1;
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = false;
        service.resizeTopRight(mouseCoordinates);
        expect(service.selection.startingPoint.y).toEqual(mouseCoordinates.y);
    });

    it('resizeTopLeft should call adjustSelectionAspectRatio if shift key is down', () => {
        const adjustSelectionAspectRatioSpy = spyOn(service, 'adjustSelectionAspectRatio');
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = true;
        service.resizeTopLeft(mouseCoordinates);
        expect(adjustSelectionAspectRatioSpy).toHaveBeenCalled();
    });

    it('resizeTopLeft should move the starting point vertically and horizontally to follow mouse position if shift is not pressed', () => {
        service.selection.startingPoint.y = 1;
        service.selection.startingPoint.x = 1;
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = false;
        service.resizeTopLeft(mouseCoordinates);
        expect(service.selection.startingPoint.y).toEqual(mouseCoordinates.y);
        expect(service.selection.startingPoint.x).toEqual(mouseCoordinates.x);
    });

    it('resizeBottomRight should call adjustSelectionAspectRatio if shift key is down', () => {
        const adjustSelectionAspectRatioSpy = spyOn(service, 'adjustSelectionAspectRatio');
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = true;
        service.resizeBottomRight(mouseCoordinates);
        expect(adjustSelectionAspectRatioSpy).toHaveBeenCalled();
    });

    it('resizeBottomRight should not move the starting point if shift is false', () => {
        service.selection.startingPoint.y = 1;
        service.selection.startingPoint.x = 1;
        const mouseCoordinates = { x: 5, y: 5 };
        service.isShiftKeyDown = false;
        service.resizeBottomRight(mouseCoordinates);
        expect(service.selection.startingPoint.y).toEqual(1);
        expect(service.selection.startingPoint.x).toEqual(1);
    });

    it('selection width should equal selection height on a 1/1 width/height ratio after resize', () => {
        service['selectionBeforeResize'] = {
            startingPoint: {
                x: 0,
                y: 0,
            },
            width: 1,
            height: 1,
        };
        const mouseCoordinates = { x: 10, y: 10 };
        const referenceCoordinates = { x: 0, y: 0 };
        service.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);
        expect(service.newSelection.width).toEqual(service.newSelection.height);
    });

    it('selection width should equal negative selection height on a 1/1 width/height ratio after resize', () => {
        service['selectionBeforeResize'] = {
            startingPoint: {
                x: 0,
                y: 0,
            },
            width: 1,
            height: 1,
        };
        service['isHorizontalScaleNegative'] = true;
        service['isVerticalScaleNegative'] = true;
        const mouseCoordinates = { x: 10, y: 10 };
        const referenceCoordinates = { x: 0, y: 0 };
        service.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);
        expect(service.newSelection.width).toEqual(service.newSelection.height);
    });

    it('if width/height ratio is 2 before resize, width should be double the height after resize', () => {
        service['selectionBeforeResize'] = {
            startingPoint: {
                x: 0,
                y: 0,
            },
            width: 2,
            height: 1,
        };
        const mouseCoordinates = { x: 10, y: 10 };
        const referenceCoordinates = { x: 20, y: 15 };
        service.adjustSelectionAspectRatio(referenceCoordinates, mouseCoordinates);
        expect(service.newSelection.width).toEqual(2 * service.newSelection.height);
    });

    it('if width is negative and height is positive, scaling factor should be negative horizontally', () => {
        service.newSelection.width = -1;
        service.newSelection.height = 1;
        service.drawSelectionOnPreviewCtx();
        expect(previewCtxSpy.scale).toHaveBeenCalledWith(-1, 1);
    });

    it('if width is negative and height is negative, scaling factor should be negative horizontally and vertically', () => {
        service.newSelection.width = -1;
        service.newSelection.height = -1;
        service.drawSelectionOnPreviewCtx();
        expect(previewCtxSpy.scale).toHaveBeenCalledWith(-1, -1);
    });

    it('if width is positive and height is negative, scaling factor should be negative vertically', () => {
        service.newSelection.width = 1;
        service.newSelection.height = -1;
        service.drawSelectionOnPreviewCtx();
        expect(previewCtxSpy.scale).toHaveBeenCalledWith(1, -1);
    });
});
