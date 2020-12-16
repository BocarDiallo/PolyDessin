import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Brush } from '@app/classes/tool-properties';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    name: string = TOOL_NAMES.BRUSH_TOOL_NAME;
    private brushData: Brush;

    constructor(
        drawingService: DrawingService,
        public colorSelectionService: ColorSelectionService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService);
        this.brushData = {
            type: 'brush',
            path: [],
            lineWidth: 1,
            lineCap: 'round',
            pattern: 'none',
            primaryColor: this.colorSelectionService.primaryColor,
        };
    }

    getLineWidth(): number {
        return this.brushData.lineWidth;
    }

    reset(): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button !== MouseButton.LEFT) {
            return;
        } else {
            this.mouseDown = true;
            this.clearPath();
            this.applyPattern(this.brushData.pattern);
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.brushData.path.push(this.mouseDownCoord);
            this.brushData.primaryColor = this.colorSelectionService.primaryColor;
            this.drawLine(this.drawingService.previewCtx, this.brushData);
            this.undoRedoStackService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.brushData.path.push(mousePosition);
            this.brushData.primaryColor = this.colorSelectionService.primaryColor;
            this.drawLine(this.drawingService.baseCtx, this.brushData);
            this.undoRedoStackService.updateStack(this.brushData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.applyPattern('none');
            this.undoRedoStackService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.clearPath();
        this.drawingService.autoSave();
    }

    onMouseLeave(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.brushData.primaryColor = this.colorSelectionService.primaryColor;
        this.drawLine(this.drawingService.baseCtx, this.brushData);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.brushData.path.push(mousePosition);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.brushData);
        }
    }

    changeWidth(newWidth: number): void {
        this.brushData.lineWidth = newWidth;
    }

    setPattern(pattern: string): void {
        this.brushData.pattern = pattern;
    }

    drawLine(ctx: CanvasRenderingContext2D, brush: Brush): void {
        this.applyPattern(brush.pattern);
        ctx.lineWidth = brush.lineWidth;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = brush.primaryColor;
        ctx.beginPath();
        for (const point of brush.path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    applyPattern(pattern: string): void {
        if (pattern === 'none') {
            this.drawingService.baseCtx.filter = 'none';
            this.drawingService.previewCtx.filter = 'none';
        } else {
            this.drawingService.baseCtx.filter = 'url(/assets/patterns.svg#' + pattern + ')';
            this.drawingService.previewCtx.filter = 'url(/assets/patterns.svg#' + pattern + ')';
        }
        this.drawingService.baseCtx.strokeRect(-this.drawingService.baseCtx.lineWidth, 0, 1, 0);
        this.drawingService.previewCtx.strokeRect(-this.drawingService.previewCtx.lineWidth, 0, 1, 0);
    }

    private clearPath(): void {
        this.brushData.path = [];
    }
}
