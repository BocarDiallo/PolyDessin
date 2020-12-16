import { Injectable } from '@angular/core';
import { Trigonometry } from '@app/classes/math/trigonometry';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Rectangle } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { MouseButton, Quadrant } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';

@Injectable({
    providedIn: 'root',
})
export class SquareService extends Tool {
    name: string = TOOL_NAMES.SQUARE_TOOL_NAME;
    mouseDown: boolean = false;
    rectangleData: Rectangle;
    lastPoint: Vec2;
    firstPoint: Vec2;
    previewLayer: HTMLElement | null;
    trigonometry: Trigonometry = new Trigonometry();

    constructor(
        drawingService: DrawingService,
        public colorSelectionService: ColorSelectionService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService);
        this.rectangleData = {
            type: 'rectangle',
            primaryColor: this.colorSelectionService.primaryColor,
            secondaryColor: this.colorSelectionService.secondaryColor,
            height: 0,
            width: 0,
            topLeftPoint: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.FILL_AND_BORDER,
            isShiftDown: false,
            lineWidth: 1,
        };
    }

    initialize(): void {
        this.mouseDown = false;
        this.drawingService.previewCtx.lineJoin = 'miter';
        this.drawingService.baseCtx.lineJoin = 'miter';
    }

    setIsShiftDown(isShiftDown: boolean): void {
        this.rectangleData.isShiftDown = isShiftDown;
    }

    setFirstPoint(newPoint: Vec2): void {
        this.firstPoint = newPoint;
    }

    setLastPoint(newPoint: Vec2): void {
        this.lastPoint = newPoint;
    }

    setFillStyle(newFillStyle: number): void {
        this.rectangleData.fillStyle = newFillStyle;
    }

    getFillStyle(): number {
        return this.rectangleData.fillStyle;
    }

    setRectangleWidth(): void {
        this.rectangleData.width = Math.abs(this.firstPoint.x - this.lastPoint.x);
    }

    setRectangleHeight(): void {
        this.rectangleData.height = Math.abs(this.firstPoint.y - this.lastPoint.y);
    }

    changeWidth(newWidth: number): void {
        this.rectangleData.lineWidth = newWidth;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.firstPoint = this.getPositionFromMouse(event);
            this.lastPoint = this.getPositionFromMouse(event);
            this.undoRedoStackService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.lastPoint = this.getPositionFromMouse(event);
            this.drawShape(this.drawingService.baseCtx);
            this.mouseDown = false;
            this.undoRedoStackService.setIsToolInUse(false);
            this.drawingService.autoSave();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.rectangleData.isShiftDown = true;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.rectangleData.isShiftDown) {
            this.rectangleData.isShiftDown = false;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.lastPoint = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    drawShape(ctx: CanvasRenderingContext2D): SelectionBox {
        this.setRectangleHeight();
        this.setRectangleWidth();

        if (this.rectangleData.isShiftDown) {
            this.rectangleData.width = Math.min(this.rectangleData.height, this.rectangleData.width);
            this.rectangleData.height = this.rectangleData.width;
            this.setSquareAttributes();
        } else {
            this.rectangleData.topLeftPoint = this.trigonometry.findTopLeftPointCircle(this.firstPoint, this.lastPoint);
        }

        this.updateRectangleDataColor();
        this.drawRectangle(ctx, this.rectangleData);

        if (ctx === this.drawingService.baseCtx) {
            this.undoRedoStackService.updateStack(this.rectangleData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }

        return { startingPoint: this.rectangleData.topLeftPoint, width: this.rectangleData.width, height: this.rectangleData.height };
    }

    drawRectangle(ctx: CanvasRenderingContext2D, rectangle: Rectangle): void {
        ctx.fillStyle = rectangle.primaryColor;
        ctx.strokeStyle = rectangle.secondaryColor;
        ctx.lineWidth = rectangle.lineWidth;
        if (rectangle.fillStyle === FILL_STYLES.FILL) {
            ctx.strokeStyle = rectangle.primaryColor;
            ctx.lineWidth = 1;
        }
        ctx.beginPath();
        if (rectangle.width > ctx.lineWidth && rectangle.height > ctx.lineWidth) {
            rectangle.width -= ctx.lineWidth;
            rectangle.height -= ctx.lineWidth;
            rectangle.topLeftPoint.x += ctx.lineWidth / 2;
            rectangle.topLeftPoint.y += ctx.lineWidth / 2;
            ctx.rect(rectangle.topLeftPoint.x, rectangle.topLeftPoint.y, rectangle.width, rectangle.height);
            if (rectangle.fillStyle !== FILL_STYLES.BORDER && rectangle.fillStyle !== FILL_STYLES.DASHED) {
                ctx.fillRect(rectangle.topLeftPoint.x, rectangle.topLeftPoint.y, rectangle.width, rectangle.height);
            }
            rectangle.width += ctx.lineWidth;
            rectangle.height += ctx.lineWidth;
        }
        ctx.stroke();
    }

    setSquareAttributes(): void {
        switch (this.trigonometry.findQuadrant(this.firstPoint, this.lastPoint)) {
            case Quadrant.BOTTOM_LEFT:
                this.rectangleData.topLeftPoint.x = this.firstPoint.x - this.rectangleData.width;
                this.rectangleData.topLeftPoint.y = this.firstPoint.y;
                break;
            case Quadrant.TOP_LEFT:
                this.rectangleData.topLeftPoint.x = this.firstPoint.x - this.rectangleData.width;
                this.rectangleData.topLeftPoint.y = this.firstPoint.y - this.rectangleData.height;
                break;
            case Quadrant.BOTTOM_RIGHT:
                this.rectangleData.topLeftPoint.x = this.firstPoint.x;
                this.rectangleData.topLeftPoint.y = this.firstPoint.y;
                break;
            case Quadrant.TOP_RIGHT:
                this.rectangleData.topLeftPoint.x = this.firstPoint.x;
                this.rectangleData.topLeftPoint.y = this.firstPoint.y - this.rectangleData.height;
                break;
        }
    }

    private updateRectangleDataColor(): void {
        this.rectangleData.primaryColor = this.colorSelectionService.primaryColor;
        this.rectangleData.secondaryColor = this.colorSelectionService.secondaryColor;
    }
}
