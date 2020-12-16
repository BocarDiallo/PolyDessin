import { Injectable } from '@angular/core';
import { Trigonometry } from '@app/classes/math/trigonometry';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Ellipse } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { FILL_STYLES } from '@app/ressources/global-variables/fill-styles';
import { DASH_LENGTH, DASH_SPACE_LENGTH, MouseButton, Quadrant } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';

@Injectable({
    providedIn: 'root',
})
export class CircleService extends Tool {
    name: string = TOOL_NAMES.CIRCLE_TOOL_NAME;
    mouseDown: boolean = false;
    private ellipseHeight: number;
    private ellipseWidth: number;
    private ellipseData: Ellipse;
    private circleHeight: number;
    private circleWidth: number;
    private quadrant: number;
    private trigonometry: Trigonometry = new Trigonometry();

    constructor(
        drawingService: DrawingService,
        public colorSelectionService: ColorSelectionService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService);
        this.ellipseData = {
            type: 'ellipse',
            primaryColor: this.colorSelectionService.primaryColor,
            secondaryColor: this.colorSelectionService.secondaryColor,
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            fillStyle: FILL_STYLES.FILL_AND_BORDER,
            isShiftDown: false,
            lineWidth: 1,
            firstPoint: { x: 0, y: 0 },
            lastPoint: { x: 0, y: 0 },
        };
    }

    getLineWidth(): number {
        return this.ellipseData.lineWidth;
    }

    setIsShiftDown(isShiftDown: boolean): void {
        this.ellipseData.isShiftDown = isShiftDown;
    }

    setFirstPoint(newPoint: Vec2): void {
        this.ellipseData.firstPoint = newPoint;
    }

    setLastPoint(newPoint: Vec2): void {
        this.ellipseData.lastPoint = newPoint;
    }

    setFillStyle(newFillStyle: number): void {
        this.ellipseData.fillStyle = newFillStyle;
    }

    getFillStyle(): number {
        return this.ellipseData.fillStyle;
    }

    initialize(): void {
        this.mouseDown = false;
    }

    changeWidth(newWidth: number): void {
        this.ellipseData.lineWidth = newWidth;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.ellipseData.isShiftDown = true;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Shift' && this.ellipseData.isShiftDown) {
            this.ellipseData.isShiftDown = false;
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawShape(this.drawingService.previewCtx);
            }
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.ellipseData.firstPoint = this.getPositionFromMouse(event);
            this.ellipseData.lastPoint = this.getPositionFromMouse(event);
            this.undoRedoStackService.setIsToolInUse(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.ellipseData.lastPoint = this.getPositionFromMouse(event);
            this.drawShape(this.drawingService.baseCtx);
            this.mouseDown = false;
            this.undoRedoStackService.setIsToolInUse(false);
        }
        this.drawingService.autoSave();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.ellipseData.lastPoint = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawShape(this.drawingService.previewCtx);
        }
    }

    drawShape(ctx: CanvasRenderingContext2D): SelectionBox {
        const topLeftPoint = this.trigonometry.findTopLeftPointCircle(this.ellipseData.firstPoint, this.ellipseData.lastPoint);
        ctx.fillStyle = this.colorSelectionService.primaryColor;
        ctx.strokeStyle = this.colorSelectionService.secondaryColor;
        ctx.lineWidth = this.ellipseData.lineWidth;
        ctx.setLineDash([0]);

        if (this.ellipseData.fillStyle === FILL_STYLES.FILL) {
            ctx.strokeStyle = this.colorSelectionService.primaryColor;
            ctx.lineWidth = 1;
        }

        this.setEllipseHeight();
        this.setEllipseWidth();
        this.ellipseData.radius = { x: this.ellipseWidth / 2, y: this.ellipseHeight / 2 };
        this.ellipseData.center = { x: topLeftPoint.x + this.ellipseData.radius.x, y: topLeftPoint.y + this.ellipseData.radius.y };

        if (this.ellipseData.isShiftDown) {
            this.drawCircle(ctx, topLeftPoint);
        } else {
            this.updateEllipseDataColor();
            this.drawEllipse(ctx, this.ellipseData);
        }

        if (ctx === this.drawingService.previewCtx) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.setLineDash([DASH_LENGTH, DASH_SPACE_LENGTH]);
            ctx.rect(topLeftPoint.x, topLeftPoint.y, this.ellipseWidth, this.ellipseHeight);
            ctx.stroke();
            ctx.lineWidth = this.ellipseData.lineWidth;
        } else {
            this.undoRedoStackService.updateStack(this.ellipseData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.setLineDash([0]);
        }

        topLeftPoint.x = this.ellipseData.center.x - this.ellipseData.radius.x;
        topLeftPoint.y = this.ellipseData.center.y - this.ellipseData.radius.y;
        return { startingPoint: topLeftPoint, width: this.ellipseData.radius.x * 2, height: this.ellipseData.radius.y * 2 };
    }

    drawEllipse(ctx: CanvasRenderingContext2D, ellipse: Ellipse): void {
        ctx.fillStyle = ellipse.primaryColor;
        ctx.strokeStyle = ellipse.secondaryColor;
        ctx.lineWidth = ellipse.lineWidth;

        if (ellipse.fillStyle === FILL_STYLES.FILL) {
            ctx.strokeStyle = ellipse.primaryColor;
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        if (ellipse.radius.x > ctx.lineWidth / 2 && ellipse.radius.y > ctx.lineWidth / 2) {
            ellipse.radius.x -= ctx.lineWidth / 2;
            ellipse.radius.y -= ctx.lineWidth / 2;
            ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radius.x, ellipse.radius.y, 0, 0, Math.PI * 2, false);
            if (ellipse.fillStyle !== FILL_STYLES.BORDER && ellipse.fillStyle !== FILL_STYLES.DASHED) {
                ctx.fill();
            }
        }

        ctx.stroke();
    }

    drawCircle(ctx: CanvasRenderingContext2D, point: Vec2): void {
        this.setCircleHeight();
        this.setCircleWidth();
        this.quadrant = this.trigonometry.findQuadrant(this.ellipseData.firstPoint, this.ellipseData.lastPoint);
        const ellipseRadiusX = this.circleWidth / 2;
        const ellipseRadiusY = this.circleHeight / 2;
        let circleRadius = Math.min(ellipseRadiusX, ellipseRadiusY);
        let ellipseCenterX = point.x + circleRadius;
        let ellipseCenterY = point.y + circleRadius;
        switch (this.quadrant) {
            case Quadrant.BOTTOM_LEFT:
                ellipseCenterX = this.ellipseData.firstPoint.x - circleRadius;
                ellipseCenterY = this.ellipseData.firstPoint.y + circleRadius;
                break;
            case Quadrant.TOP_LEFT:
                ellipseCenterX = this.ellipseData.firstPoint.x - circleRadius;
                ellipseCenterY = this.ellipseData.firstPoint.y - circleRadius;
                break;
            case Quadrant.BOTTOM_RIGHT:
                ellipseCenterX = this.ellipseData.firstPoint.x + circleRadius;
                ellipseCenterY = this.ellipseData.firstPoint.y + circleRadius;
                break;
            case Quadrant.TOP_RIGHT:
                ellipseCenterX = this.ellipseData.firstPoint.x + circleRadius;
                ellipseCenterY = this.ellipseData.firstPoint.y - circleRadius;
                break;
        }
        ctx.beginPath();
        if (circleRadius > ctx.lineWidth / 2) {
            circleRadius -= ctx.lineWidth / 2;
            ctx.arc(ellipseCenterX, ellipseCenterY, circleRadius, 0, Math.PI * 2, false);
            if (this.ellipseData.fillStyle !== FILL_STYLES.BORDER && this.ellipseData.fillStyle !== FILL_STYLES.DASHED) {
                ctx.fill();
            }
        }

        ctx.stroke();

        this.ellipseData.radius = { x: circleRadius, y: circleRadius };
        this.ellipseData.center = { x: ellipseCenterX, y: ellipseCenterY };
        this.updateEllipseDataColor();
    }

    setEllipseWidth(): void {
        this.ellipseWidth = Math.abs(this.ellipseData.firstPoint.x - this.ellipseData.lastPoint.x);
    }

    setEllipseHeight(): void {
        this.ellipseHeight = Math.abs(this.ellipseData.firstPoint.y - this.ellipseData.lastPoint.y);
    }

    private updateEllipseDataColor(): void {
        this.ellipseData.primaryColor = this.colorSelectionService.primaryColor;
        this.ellipseData.secondaryColor = this.colorSelectionService.secondaryColor;
    }

    setCircleWidth(): void {
        this.circleWidth = Math.abs(this.ellipseData.firstPoint.x - this.ellipseData.lastPoint.x);
    }

    setCircleHeight(): void {
        this.circleHeight = Math.abs(this.ellipseData.firstPoint.y - this.ellipseData.lastPoint.y);
    }
}
