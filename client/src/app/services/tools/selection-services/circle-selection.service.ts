import { Injectable } from '@angular/core';
import { SelectionType } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CircleService } from '@app/services/tools/circle.service';
import { MoveService } from '@app/services/tools/transformation-services/move.service';
import { RotateService } from '@app/services/tools/transformation-services/rotate.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';
import { MagnetismService } from './magnetism.service';
import { SelectionResizeService } from './selection-resize.service';
import { SelectionService } from './selection.service';

@Injectable({
    providedIn: 'root',
})
export class CircleSelectionService extends SelectionService {
    name: string = TOOL_NAMES.CIRCLE_SELECTION_TOOL_NAME;
    constructor(
        drawingService: DrawingService,
        public circleService: CircleService,
        public moveService: MoveService,
        public rotateService: RotateService,
        public clipboardService: ClipboardService,
        public magnetismService: MagnetismService,
        public selectionResizeService: SelectionResizeService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService, moveService, rotateService, clipboardService, magnetismService, selectionResizeService, undoRedoStackService);
        super.underlyingService = circleService;
        this.selectionType = SelectionType.CIRCLE;
    }

    setSelectionData(): void {
        this.selectionImage.width = this.selection.width;
        this.selectionImage.height = this.selection.height;
        const selectionImageCtx = this.selectionImage.getContext('2d') as CanvasRenderingContext2D;

        selectionImageCtx.beginPath();
        selectionImageCtx.ellipse(
            this.selection.width / 2,
            this.selection.height / 2,
            this.selection.width / 2,
            this.selection.height / 2,
            0,
            0,
            Math.PI * 2,
        );
        selectionImageCtx.clip();
        selectionImageCtx.closePath();

        selectionImageCtx.drawImage(
            this.drawingService.canvas,
            this.selection.startingPoint.x,
            this.selection.startingPoint.y,
            this.selection.width,
            this.selection.height,
            0,
            0,
            this.selection.width,
            this.selection.height,
        );
        this.moveService.initialize(this.selection, this.selectionImage);
        this.rotateService.initialize(this.selection, this.selectionImage);
    }

    setMagnetismAlignment(alignment: string): void {
        this.currentAlignment = alignment;
    }

    strokeSelection(): void {
        if (this.selection.height !== 0 && this.selection.width !== 0) {
            this.drawingService.previewCtx.beginPath();
            this.drawingService.previewCtx.save();
            this.rotateService.rotatePreviewCanvas();
            this.drawingService.previewCtx.ellipse(
                this.selection.startingPoint.x + this.selection.width / 2,
                this.selection.startingPoint.y + this.selection.height / 2,
                this.selection.width / 2,
                this.selection.height / 2,
                0,
                0,
                Math.PI * 2,
            );
            this.drawingService.previewCtx.strokeRect(
                this.moveService.selection.startingPoint.x,
                this.moveService.selection.startingPoint.y,
                this.selection.width,
                this.selection.height,
            );
            this.drawingService.previewCtx.restore();
            this.drawingService.previewCtx.stroke();
            this.strokeSelectionBox();
            this.setSelectionPoint();
        }
        this.drawingService.autoSave();
    }
}
