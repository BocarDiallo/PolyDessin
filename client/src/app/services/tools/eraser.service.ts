import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Eraser } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { MIN_ERASER_TOOL_WIDTH, MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    name: string = TOOL_NAMES.ERASER_TOOL_NAME;
    eraserData: Eraser;
    minToolWidth: number = MIN_ERASER_TOOL_WIDTH;

    constructor(drawingService: DrawingService, public undoRedoStackService: UndoRedoStackService) {
        super(drawingService);
        this.eraserData = {
            type: 'eraser',
            path: [],
            lineWidth: 5,
            lineCap: 'square',
            fillStyle: 'white',
            primaryColor: 'white',
        };
        this.clearPath();
    }

    setCursor(): void {
        this.drawingService.gridCanvas.style.cursor = 'none';
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.eraserData.path.push(this.mouseDownCoord);
            this.drawRect(this.drawingService.previewCtx, this.eraserData.path);
            this.undoRedoStackService.setIsToolInUse(true);
        }
        this.squareCursor(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.eraserData.path.push(mousePosition);
            this.drawEraserStroke(this.drawingService.baseCtx, this.eraserData);
            this.undoRedoStackService.updateStack(this.eraserData);
            this.undoRedoStackService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.clearPath();
        this.drawingService.autoSave();
    }

    onMouseLeave(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawEraserStroke(this.drawingService.baseCtx, this.eraserData);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.eraserData.path.push(mousePosition);
            this.drawEraserStroke(this.drawingService.previewCtx, this.eraserData);
        }
        this.squareCursor(event);
    }

    private squareCursor(event: MouseEvent): void {
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.fillStyle = 'white';
        this.drawingService.previewCtx.strokeRect(
            this.getPositionFromMouse(event).x - this.eraserData.lineWidth / 2,
            this.getPositionFromMouse(event).y - this.eraserData.lineWidth / 2,
            this.eraserData.lineWidth,
            this.eraserData.lineWidth,
        );
        this.drawingService.previewCtx.fillRect(
            this.getPositionFromMouse(event).x - this.eraserData.lineWidth / 2,
            this.getPositionFromMouse(event).y - this.eraserData.lineWidth / 2,
            this.eraserData.lineWidth,
            this.eraserData.lineWidth,
        );
    }

    drawEraserStroke(ctx: CanvasRenderingContext2D, eraser: Eraser): void {
        ctx.lineWidth = eraser.lineWidth;
        ctx.strokeStyle = 'white';
        ctx.lineCap = 'square';
        ctx.beginPath();
        for (const point of eraser.path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    changeWidth(newWidth: number): void {
        this.eraserData.lineWidth = newWidth;
    }

    private drawRect(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        for (const point of path) {
            ctx.rect(
                point.x - this.eraserData.lineWidth / 2,
                point.y - this.eraserData.lineWidth / 2,
                this.eraserData.lineWidth,
                this.eraserData.lineWidth,
            );
        }
        ctx.fill();
        ctx.stroke();
    }

    private clearPath(): void {
        this.eraserData.path = [];
    }
}
