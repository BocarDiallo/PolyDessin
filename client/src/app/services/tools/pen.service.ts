import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Pen } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { ANGLE_HALF_TURN, MouseButton, ROTATION_STEP } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';
import { Observable, Subject } from 'rxjs';

// this tool was inpired by the code found on http://perfectionkills.com/exploring-canvas-drawing-techniques/

@Injectable({
    providedIn: 'root',
})
export class PenService extends Tool {
    name: string = TOOL_NAMES.PEN_TOOL_NAME;
    width: number = 1;
    angle: number = 0;
    angleObservable: Subject<number> = new Subject<number>();
    altKeyPressed: boolean = false;
    lastPoint: Vec2;
    currentPoint: Vec2;
    penData: Pen;
    canvasData: ImageData;

    constructor(
        drawingService: DrawingService,
        public colorSelectionService: ColorSelectionService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService);
    }

    changeWidth(newWidth: number): void {
        this.width = newWidth;
    }

    changeAngle(newAngle: number): void {
        newAngle %= ANGLE_HALF_TURN;
        if (newAngle < 0) {
            newAngle += ANGLE_HALF_TURN;
        }
        this.angle = newAngle;
        this.angleObservable.next(this.angle);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.lastPoint = this.getPositionFromMouse(event);
            this.currentPoint = this.getPositionFromMouse(event);
            this.drawPenStroke(this.drawingService.previewCtx);
            this.undoRedoStackService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.applyPreview();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.undoRedoStackService.setIsToolInUse(false);
            this.canvasData = this.drawingService.getCanvasData();
            this.updatePenData();
            this.undoRedoStackService.updateStack(this.penData);
        }
        this.mouseDown = false;
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.lastPoint = this.currentPoint;
            this.currentPoint = this.getPositionFromMouse(event);
            this.drawPenStroke(this.drawingService.previewCtx);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.altKey && !this.altKeyPressed) {
            event.preventDefault();
            this.altKeyPressed = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Alt') {
            this.altKeyPressed = false;
        }
    }

    onWheelEvent(event: WheelEvent): void {
        let rotationStep = ROTATION_STEP;
        if (this.altKeyPressed) {
            rotationStep = 1;
        }
        const newAngle = this.angle - (event.deltaY / Math.abs(event.deltaY)) * rotationStep;
        this.changeAngle(newAngle);
    }

    drawPenStroke(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.colorSelectionService.primaryColor;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        const lastPoint = this.lastPoint;
        const point = this.currentPoint;
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        const angleRadians = this.toRadians(this.angle);
        for (let j = 1; j <= this.width / 2; j++) {
            ctx.moveTo(lastPoint.x - j * Math.sin(angleRadians), lastPoint.y - j * Math.cos(angleRadians));
            ctx.lineTo(point.x - j * Math.sin(angleRadians), point.y - j * Math.cos(angleRadians));
            ctx.moveTo(lastPoint.x + j * Math.sin(angleRadians), lastPoint.y + j * Math.cos(angleRadians));
            ctx.lineTo(point.x + j * Math.sin(angleRadians), point.y + j * Math.cos(angleRadians));
        }
        ctx.stroke();
    }

    toRadians(angle: number): number {
        return angle * (Math.PI / ANGLE_HALF_TURN);
    }

    getAngle(): Observable<number> {
        return this.angleObservable;
    }

    restorePen(penData: Pen): void {
        this.drawingService.baseCtx.putImageData(penData.imageData, 0, 0);
    }

    updatePenData(): void {
        this.penData = {
            type: 'pen',
            imageData: this.canvasData,
        };
        this.drawingService.autoSave();
    }
}
