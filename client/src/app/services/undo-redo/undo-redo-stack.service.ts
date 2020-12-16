import { Injectable } from '@angular/core';
import { ToolProperties } from '@app/classes/tool-properties';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoStackService {
    undoStack: ToolProperties[] = [];
    redoStack: ToolProperties[] = [];
    isToolInUse: Subject<boolean> = new Subject<boolean>();

    setIsToolInUse(isInUse: boolean): void {
        this.isToolInUse.next(isInUse);
    }

    getIsToolInUse(): Observable<boolean> {
        return this.isToolInUse.asObservable();
    }

    updateStack(modification: ToolProperties): void {
        this.undoStack.push(Object.assign({}, modification));
        if (this.redoStack.length) {
            this.redoStack = [];
        }
    }

    resetStack(): void {
        this.undoStack = [];
        this.redoStack = [];
    }
}
