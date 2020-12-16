import { Injectable } from '@angular/core';
import { Trigonometry } from '@app/classes/math/trigonometry';
import { Tool } from '@app/classes/tool';
import { Line } from '@app/classes/tool-properties';
import { Vec2 } from '@app/classes/vec2';
import { LineAngle, MouseButton, Quadrant } from '@app/ressources/global-variables/global-variables';
import { TOOL_NAMES } from '@app/ressources/global-variables/tool-names';
import { ColorSelectionService } from '@app/services/color-selection/color-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoStackService } from '@app/services/undo-redo/undo-redo-stack.service';
@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    trigonometry: Trigonometry = new Trigonometry();
    name: string = TOOL_NAMES.LINE_TOOL_NAME;
    shiftClick: Vec2 = { x: 0, y: 0 };
    isShiftKeyDown: boolean = false;
    endingClickCoordinates: Vec2;
    isDrawing: boolean = false;
    numberOfClicks: number = 0;
    mouseEvent: MouseEvent;
    lineData: Line;

    constructor(
        public drawingService: DrawingService,
        public colorSelectionService: ColorSelectionService,
        public undoRedoStackService: UndoRedoStackService,
    ) {
        super(drawingService);
        this.lineData = {
            type: 'line',
            lineWidth: 1,
            lineCap: 'round',
            primaryColor: this.colorSelectionService.primaryColor,
            secondaryColor: this.colorSelectionService.secondaryColor,
            mouseClicks: [],
            storedLines: [],
            isDot: false,
            line: { startingPoint: { x: 0, y: 0 }, endingPoint: { x: 0, y: 0 } },
            isShiftDoubleClick: false,
            hasLastPointBeenChanged: false,
            dotWidth: 1,
        };
    }

    changeLineWidth(newWidth: number): void {
        this.lineData.lineWidth = newWidth;
    }

    changeJunction(isDot: boolean): void {
        this.lineData.isDot = isDot;
    }

    changeDotWidth(newWidth: number): void {
        this.lineData.dotWidth = newWidth;
    }

    onMouseDown(event: MouseEvent): void {
        this.undoRedoStackService.setIsToolInUse(true);
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.button !== MouseButton.LEFT) {
            return;
        }
        this.isDrawing = true;
        this.lineData.mouseClicks.push(this.getPositionFromMouse(event));
        this.numberOfClicks = this.lineData.mouseClicks.length;

        // Check if it's a new line
        if (this.numberOfClicks <= 1) {
            return;
        }

        // Check if it's a double click holding shift
        if (this.getPositionFromMouse(event).x === this.shiftClick.x && this.getPositionFromMouse(event).y === this.shiftClick.y) {
            this.lineData.isShiftDoubleClick = true;
        }
        this.shiftClick = this.getPositionFromMouse(event);

        // Check if it is a double click
        const isDoubleClick: boolean = this.checkIfDoubleClick();
        if (isDoubleClick || this.lineData.isShiftDoubleClick) {
            this.isDrawing = false;
            // Handle case when user double click when there is no line
            if (
                this.lineData.mouseClicks[0].x === this.lineData.mouseClicks[1].x &&
                this.lineData.mouseClicks[0].y === this.lineData.mouseClicks[1].y
            ) {
                this.lineData.mouseClicks = [];
                this.numberOfClicks = 0;
                return;
            }
            // Check if the last point is 20px away from initial point
            const distance = this.trigonometry.distanceBetweenTwoDots(
                this.lineData.mouseClicks[0],
                this.lineData.mouseClicks[this.numberOfClicks - 2],
            );
            if (distance < this.trigonometry.MAX_DISTANCE_BETWEEN_TWO_DOTS) {
                // Replace the ending point received from the click coordinates with the inital point of the line
                this.lineData.mouseClicks[this.lineData.mouseClicks.length - 1] = this.lineData.mouseClicks[0];
                this.lineData.storedLines[this.lineData.storedLines.length - 1].endingPoint = this.lineData.mouseClicks[0];
                this.lineData.hasLastPointBeenChanged = true;
            }

            // Draw line on base canvas
            this.lineData.primaryColor = this.colorSelectionService.primaryColor;
            this.lineData.secondaryColor = this.colorSelectionService.secondaryColor;
            this.drawFullLine(this.drawingService.baseCtx, this.lineData);
            this.undoRedoStackService.updateStack(this.lineData);
            this.lineData.hasLastPointBeenChanged = false;

            // Clear the preview canvas, the stored clicks and the stored lines used for previewing
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.lineData.storedLines = [];
            this.lineData.mouseClicks = [];
            this.lineData.isShiftDoubleClick = false;
            this.undoRedoStackService.setIsToolInUse(false);
            return;
        }
        this.drawSegment();
        this.drawingService.autoSave();
    }

    drawSegment(): void {
        if (!this.isDrawing) {
            return;
        }
        this.lineData.line = {
            startingPoint: this.lineData.mouseClicks[this.numberOfClicks - 2],
            endingPoint: this.endingClickCoordinates,
        };
        this.drawLine(this.lineData.line.startingPoint, this.lineData.line.endingPoint, this.drawingService.previewCtx, this.lineData.lineWidth);

        if (this.lineData.isDot) {
            this.drawDots(this.lineData.dotWidth, this.drawingService.previewCtx);
        }
        this.lineData.storedLines.push(this.lineData.line);

        this.lineData.mouseClicks[this.lineData.mouseClicks.length - 1] = this.endingClickCoordinates;
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseEvent = event;
        if (!this.isDrawing) return;

        // Clear the old line segment preview
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        // Restore previous line segments
        this.lineData.storedLines.forEach((line) => {
            this.drawLine(line.startingPoint, line.endingPoint, this.drawingService.previewCtx, this.lineData.lineWidth);
        });

        if (this.lineData.isDot) {
            this.drawDots(this.lineData.dotWidth, this.drawingService.previewCtx);
        }

        if (this.isShiftKeyDown) {
            // Handle angles (set a different ending coordinates depending on mouse position)
            this.adjustLineAngle(this.getPositionFromMouse(event));
        } else {
            // Get new coordinates for end of line
            this.endingClickCoordinates = this.getPositionFromMouse(event);
        }
        this.drawLine(
            this.lineData.mouseClicks[this.numberOfClicks - 1],
            this.endingClickCoordinates,
            this.drawingService.previewCtx,
            this.lineData.lineWidth,
        );
    }

    checkIfDoubleClick(): boolean {
        const previousClickX = this.lineData.mouseClicks[this.numberOfClicks - 2].x;
        const previousClickY = this.lineData.mouseClicks[this.numberOfClicks - 2].y;
        const currentClickX = this.lineData.mouseClicks[this.numberOfClicks - 1].x;
        const currentClickY = this.lineData.mouseClicks[this.numberOfClicks - 1].y;
        if (previousClickX === currentClickX && previousClickY === currentClickY) {
            return true;
        }
        return false;
    }

    onKeyDown(event: KeyboardEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        if (event.key === 'Shift') {
            this.isShiftKeyDown = true;
            this.onMouseMove(this.mouseEvent);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Shift': {
                this.isShiftKeyDown = false;
                this.onMouseMove(this.mouseEvent);
                break;
            }
            case 'Backspace': {
                if (this.numberOfClicks > 1) {
                    this.deleteLastSegment();
                }
                break;
            }
            case 'Escape': {
                this.deleteLine();
                break;
            }
        }
    }

    deleteLastSegment(): void {
        this.lineData.storedLines.pop();
        this.lineData.mouseClicks.pop();
        --this.numberOfClicks;

        // Clear the old line segment preview
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        // Restore previous line segments
        this.lineData.storedLines.forEach((line) => {
            this.drawLine(line.startingPoint, line.endingPoint, this.drawingService.previewCtx, this.lineData.lineWidth);
        });

        // Draw the new line preview
        this.drawLine(
            this.lineData.mouseClicks[this.numberOfClicks - 1],
            this.endingClickCoordinates,
            this.drawingService.previewCtx,
            this.lineData.lineWidth,
        );

        if (this.lineData.isDot) {
            this.drawDots(this.lineData.dotWidth, this.drawingService.previewCtx);
        }
    }

    deleteLine(): void {
        this.lineData.storedLines = [];
        this.lineData.mouseClicks = [];
        this.numberOfClicks = 0;
        this.isDrawing = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    adjustLineAngle(mouseCoordinates: Vec2): void {
        let opposite: number;
        let adjacent: number;
        let hypothenuse: number;
        let angleDegree: number;
        let angleRadians: number;
        let quadrant: Quadrant;
        let lineAngle: LineAngle;

        adjacent = mouseCoordinates.x - this.lineData.mouseClicks[this.lineData.mouseClicks.length - 1].x;
        opposite = this.lineData.mouseClicks[this.lineData.mouseClicks.length - 1].y - mouseCoordinates.y;

        hypothenuse = Math.sqrt(Math.pow(opposite, 2) + Math.pow(adjacent, 2));
        quadrant = this.trigonometry.findCursorQuadrant(adjacent, opposite);

        adjacent = Math.abs(adjacent);
        opposite = Math.abs(opposite);

        if (!hypothenuse) {
            hypothenuse = 1;
        }
        angleRadians = Math.asin(opposite / hypothenuse);
        angleDegree = this.trigonometry.radiansToDegrees(angleRadians);
        lineAngle = this.trigonometry.findClosestAngle(quadrant, angleDegree);
        this.endingClickCoordinates = this.trigonometry.adjustEndingPoint(lineAngle, mouseCoordinates, adjacent, this.lineData.mouseClicks);
    }

    drawLine(startingPoint: Vec2, endingPoint: Vec2, ctx: CanvasRenderingContext2D, lineWidth: number): void {
        ctx.strokeStyle = this.colorSelectionService.primaryColor;
        ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(startingPoint.x, startingPoint.y);
        ctx.lineTo(endingPoint.x, endingPoint.y);
        ctx.stroke();
    }

    drawDots(width: number, ctx: CanvasRenderingContext2D): void {
        let lastDot = this.lineData.mouseClicks.length;

        if (ctx === this.drawingService.baseCtx) {
            lastDot--;
            this.lineData.mouseClicks[this.lineData.mouseClicks.length - 2] = this.lineData.mouseClicks[this.lineData.mouseClicks.length - 1];
            this.lineData.mouseClicks.pop();
            if (this.lineData.isShiftDoubleClick) {
                this.lineData.mouseClicks[this.lineData.mouseClicks.length - 1] = this.lineData.storedLines[
                    this.lineData.storedLines.length - 1
                ].endingPoint;
            }
        }
        for (let i = 0; i < lastDot; i++) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.colorSelectionService.secondaryColor;
            ctx.fillStyle = this.colorSelectionService.secondaryColor;
            ctx.beginPath();
            ctx.arc(this.lineData.mouseClicks[i].x, this.lineData.mouseClicks[i].y, width / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }

    drawFullLine(ctx: CanvasRenderingContext2D, line: Line): void {
        line.storedLines.forEach((element) => {
            ctx.strokeStyle = line.primaryColor;
            ctx.lineCap = 'round';
            ctx.lineWidth = line.lineWidth;
            ctx.beginPath();
            ctx.moveTo(element.startingPoint.x, element.startingPoint.y);
            ctx.lineTo(element.endingPoint.x, element.endingPoint.y);
            ctx.stroke();
        });

        if (line.isDot) {
            const LAST_DOT = line.mouseClicks.length;
            let doubleClickPoint: Vec2 | undefined;

            // Remove the double click that doesnt need to be drawed on the canvas
            if (line.hasLastPointBeenChanged) {
                line.mouseClicks[line.mouseClicks.length - 2] = line.mouseClicks[line.mouseClicks.length - 1];
                doubleClickPoint = line.mouseClicks.pop();
            }
            // If it's a double click holding shift adjust ending dot
            if (line.isShiftDoubleClick) {
                line.mouseClicks[line.mouseClicks.length - 1] = line.storedLines[line.storedLines.length - 1].endingPoint;
            }

            for (let i = 0; i < LAST_DOT - 1; i++) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = line.secondaryColor;
                ctx.fillStyle = line.secondaryColor;
                ctx.beginPath();
                ctx.arc(line.mouseClicks[i].x, line.mouseClicks[i].y, line.dotWidth / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }

            if (line.hasLastPointBeenChanged) {
                line.mouseClicks.push(doubleClickPoint as Vec2);
            }
        }
    }
}
