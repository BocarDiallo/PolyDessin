import { TestBed } from '@angular/core/testing';
import { SelectionBox } from '@app/classes/selection-box';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from './clipboard.service';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-any
// tslint:disable: no-magic-numbers

describe('ClipboardService', () => {
    let service: ClipboardService;
    let selection: SelectionBox;
    let selectionImage: HTMLCanvasElement;
    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(() => {
        selection = { startingPoint: { x: 0, y: 0 }, width: 10, height: 10 };
        selectionImage = document.createElement('canvas');
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(ClipboardService);

        service.clipboardCanvas = document.createElement('canvas');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('copy should call setSelection', () => {
        const setSelectionSpy = spyOn(service as any, 'setSelection');

        service.copy(selection, selectionImage, 0);

        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, selection);
    });

    it('copy should set selection', () => {
        service.selection = { startingPoint: { x: 10, y: 10 }, width: 15, height: 15 };

        service.copy(selection, selectionImage, 0);

        expect(service.selection).toEqual(selection);
    });

    it('copy should set isPasteAvailable to true using .next', () => {
        const setSelectionSpy = spyOn(service as any, 'setSelection');
        const nextSpy = spyOn(service.isPasteAvailableSubject, 'next');

        service.copy(selection, selectionImage, 0);

        expect(nextSpy).toHaveBeenCalledWith(true);
        expect(setSelectionSpy).toHaveBeenCalledWith(service.selection, selection);
    });

    it('copy should set height and width of clipboardCanvas', () => {
        service.clipboardCanvas.width = 0;
        service.clipboardCanvas.height = 0;

        service.copy(selection, selectionImage, 0);

        expect(service.clipboardCanvas.width).toEqual(service.selection.width);
        expect(service.clipboardCanvas.height).toEqual(service.selection.height);
    });

    it('copy should call drawingService.clearCanvas', () => {
        service.copy(selection, selectionImage, 30);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('copy should set angle', () => {
        service.angle = 0;

        service.copy(selection, selectionImage, 30);

        expect(service.angle).toEqual(30);
    });

    it('resetSelectionPosition should set selection.starting point', () => {
        service.selection.startingPoint = { x: 25, y: 25 };
        const selectionContour: SelectionBox = { startingPoint: { x: 10, y: 10 }, width: 15, height: 15 };

        service.resetSelectionPosition(selectionContour);

        expect(service.selection.startingPoint).toEqual({ x: 15, y: 15 });
    });

    it('resetSelectionPosition should set selection.starting point', () => {
        service.selection.startingPoint = { x: 25, y: 25 };
        const selectionContour: SelectionBox = { startingPoint: { x: 10, y: 10 }, width: 15, height: 15 };

        service.resetSelectionPosition(selectionContour);

        expect(service.selection.startingPoint).toEqual({ x: 15, y: 15 });
    });

    it('getIsPasteAvailableSubject should return false if paste is unavailable (called async)', () => {
        let returnValue = true;
        service.getIsPasteAvailableSubject().subscribe((value: boolean) => {
            returnValue = value;
        });
        service.isPasteAvailableSubject.next(false);
        expect(returnValue).toBe(false);
    });

    it('getIsPasteAvailableSubject should return true if paste is available (called async)', () => {
        let returnValue = false;
        service.getIsPasteAvailableSubject().subscribe((value: boolean) => {
            returnValue = value;
        });
        service.isPasteAvailableSubject.next(true);
        expect(returnValue).toBe(true);
    });
});
