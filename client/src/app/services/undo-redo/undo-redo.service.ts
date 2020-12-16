import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import {
    Brush,
    Ellipse,
    Eraser,
    Fill,
    Line,
    Pen,
    Pencil,
    Polygon,
    Rectangle,
    Resize,
    Selection,
    Spray,
    Stamp,
    Text,
    ToolProperties,
} from '@app/classes/tool-properties';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeDrawingService } from '@app/services/resize-drawing/resize-drawing.service';
import { BrushService } from '@app/services/tools/brush.service';
import { CircleService } from '@app/services/tools/circle.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { LineService } from '@app/services/tools/line.service';
import { PenService } from '@app/services/tools/pen.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import { SelectionService } from '@app/services/tools/selection-services/selection.service';
import { SprayService } from '@app/services/tools/spray.service';
import { SquareService } from '@app/services/tools/square.service';
import { StampService } from '@app/services/tools/stamp.service';
import { TextService } from '@app/services/tools/text.service';
import { Observable, Subject } from 'rxjs';
import { UndoRedoStackService } from './undo-redo-stack.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService extends Tool {
    isUndoAvailable: boolean = false;
    isUndoAvailableSubject: Subject<boolean> = new Subject<boolean>();
    isRedoAvailable: boolean = false;
    isRedoAvailableSubject: Subject<boolean> = new Subject<boolean>();

    constructor(
        public drawingService: DrawingService,
        public circleService: CircleService,
        public resizeDrawingService: ResizeDrawingService,
        public squareService: SquareService,
        public pencilService: PencilService,
        public eraserService: EraserService,
        public lineService: LineService,
        public brushService: BrushService,
        public polygonService: PolygonService,
        public selectionService: SelectionService,
        public stampService: StampService,
        public undoRedoStackService: UndoRedoStackService,
        public sprayService: SprayService,
        public penService: PenService,
        public textService: TextService,
    ) {
        super(drawingService);
        this.undoRedoStackService.getIsToolInUse().subscribe((value) => {
            if (value) {
                this.setUndoAvailability(false);
                this.setRedoAvailability(false);
            } else {
                this.setUndoAvailability(true);
                this.setRedoAvailability(true);
                this.changeUndoAvailability();
                this.changeRedoAvailability();
            }
        });
    }

    setUndoAvailability(isAvailable: boolean): void {
        this.isUndoAvailable = isAvailable;
        this.isUndoAvailableSubject.next(isAvailable);
    }

    setRedoAvailability(isAvailable: boolean): void {
        this.isRedoAvailable = isAvailable;
        this.isRedoAvailableSubject.next(isAvailable);
    }

    getUndoAvailability(): Observable<boolean> {
        return this.isUndoAvailableSubject.asObservable();
    }

    getRedoAvailability(): Observable<boolean> {
        return this.isRedoAvailableSubject.asObservable();
    }

    undo(): void {
        this.selectionService.reset();
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if (!this.isUndoAvailable) {
            return;
        }
        this.resizeDrawingService.resizeCanvasSize(this.resizeDrawingService.workSpaceSize.x / 2, this.resizeDrawingService.workSpaceSize.y / 2);
        const modification = this.undoRedoStackService.undoStack.pop();
        if (modification) {
            this.undoRedoStackService.redoStack.push(modification);
        }
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.undoRedoStackService.undoStack.forEach((element) => {
            this.drawElement(element);
        });
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        this.drawingService.autoSave();
    }

    redo(): void {
        this.selectionService.reset();
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        if (!this.isRedoAvailable) {
            return;
        }
        const redoStackLength = this.undoRedoStackService.redoStack.length;
        if (redoStackLength) {
            const element = this.undoRedoStackService.redoStack[redoStackLength - 1];
            this.drawElement(element);
            const modification = this.undoRedoStackService.redoStack.pop();

            this.undoRedoStackService.undoStack.push(modification as ToolProperties);
        }
        this.changeUndoAvailability();
        this.changeRedoAvailability();
        this.drawingService.autoSave();
    }

    changeUndoAvailability(): void {
        if (this.undoRedoStackService.undoStack.length) {
            this.setUndoAvailability(true);
        } else {
            this.setUndoAvailability(false);
        }
    }

    changeRedoAvailability(): void {
        if (this.undoRedoStackService.redoStack.length) {
            this.setRedoAvailability(true);
        } else {
            this.setRedoAvailability(false);
        }
    }

    drawElement(element: ToolProperties): void {
        switch (element.type) {
            case 'pencil':
                this.pencilService.drawPencilStroke(this.drawingService.baseCtx, element as Pencil);
                break;
            case 'brush':
                this.brushService.drawLine(this.drawingService.baseCtx, element as Brush);
                break;
            case 'eraser':
                this.eraserService.drawEraserStroke(this.drawingService.baseCtx, element as Eraser);
                break;
            case 'line':
                this.lineService.drawFullLine(this.drawingService.baseCtx, element as Line);
                break;
            case 'rectangle':
                this.squareService.drawRectangle(this.drawingService.baseCtx, element as Rectangle);
                break;
            case 'ellipse':
                this.circleService.drawEllipse(this.drawingService.baseCtx, element as Ellipse);
                break;
            case 'fill':
                this.drawingService.drawFill(element as Fill);
                break;
            case 'resize':
                this.resizeDrawingService.restoreCanvas(element as Resize);
                break;
            case 'polygon':
                this.polygonService.drawPolygon(this.drawingService.baseCtx, element as Polygon);
                break;
            case 'selection':
                this.drawingService.restoreSelection(element as Selection);
                break;
            case 'stamp':
                this.stampService.printStamp(this.drawingService.baseCtx, element as Stamp);
                break;
            case 'spray':
                this.sprayService.restoreSpray(element as Spray);
                break;
            case 'pen':
                this.penService.restorePen(element as Pen);
                break;
            case 'text':
                this.textService.restoreText(element as Text);
                break;
        }
    }
}
