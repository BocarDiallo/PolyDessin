import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Pencil } from '@app/classes/tool-properties';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    pencilData: Pencil;
    name: string = TOOL_NAMES.PENCIL_TOOL_NAME;

    constructor(
        drawingService: DrawingService,
        public colorSelectionService: ColorSelectionService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService);
        this.pencilData = {
            type: 'pencil',
            path: [],
            lineWidth: 1,
            primaryColor: this.colorSelectionService.primaryColor,
        };
    }

    onMouseLeave(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
        this.clearPath();
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
            this.pencilData.path.push(this.mouseDownCoord);
            this.pencilData.primaryColor = this.colorSelectionService.primaryColor;
            this.drawPencilStroke(this.drawingService.previewCtx, this.pencilData);
            this.undoRedoStackService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pencilData.path.push(mousePosition);
            this.undoRedoStackService.updateStack(this.pencilData);
            this.pencilData.primaryColor = this.colorSelectionService.primaryColor;
            this.drawPencilStroke(this.drawingService.baseCtx, this.pencilData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.undoRedoStackService.setIsToolInUse(false);
        }
        this.mouseDown = false;
        this.clearPath();
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pencilData.path.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.pencilData.primaryColor = this.colorSelectionService.primaryColor;
            this.drawPencilStroke(this.drawingService.previewCtx, this.pencilData);
        }
    }

    drawPencilStroke(ctx: CanvasRenderingContext2D, pencil: Pencil): void {
        ctx.lineWidth = pencil.lineWidth;
        ctx.strokeStyle = pencil.primaryColor;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (const point of pencil.path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    changeWidth(newWidth: number): void {
        this.pencilData.lineWidth = newWidth;
    }

    private clearPath(): void {
        this.pencilData.path = [];
    }
}
