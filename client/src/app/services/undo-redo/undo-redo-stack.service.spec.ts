import { TestBed } from '@angular/core/testing';
import { Pencil } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { UndoRedoStackService } from './undo-redo-stack.service';

describe('UndoRedoStackService', () => {
    let service: UndoRedoStackService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoStackService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update stack on updateStack', () => {
        service.undoStack = [];
        const pencil: Pencil = { type: {} as string, path: {} as Vec2[], lineWidth: 1, primaryColor: 'black' };
        service.updateStack(pencil);
        expect(service.undoStack.length).toEqual(1);
    });

    it('should update stack on updateStack and clear redo stack', () => {
        service.undoStack = [];
        const pencil: Pencil = { type: {} as string, path: {} as Vec2[], lineWidth: 1, primaryColor: 'black' };
        service.redoStack.push(pencil);
        service.updateStack(pencil);
        expect(service.undoStack.length).toEqual(1);
        expect(service.redoStack.length).toEqual(0);
    });

    it('should set tool in use', () => {
        const setSpy = spyOn(service.isToolInUse, 'next');
        service.setIsToolInUse(true);
        expect(setSpy).toHaveBeenCalled();
    });
});
