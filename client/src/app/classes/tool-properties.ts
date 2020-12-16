import { StampAttributes } from '@app/classes/stamps';
import { StraightLine } from './line';
import { Vec2 } from './vec2';

export interface ToolProperties {
    type: string;
}

export interface Pencil extends ToolProperties {
    type: string;
    path: Vec2[];
    lineWidth: number;
    primaryColor: string;
}

export interface Brush extends ToolProperties {
    type: string;
    path: Vec2[];
    lineWidth: number;
    lineCap: string;
    pattern: string;
    primaryColor: string;
}

export interface Eraser extends ToolProperties {
    type: string;
    path: Vec2[];
    lineWidth: number;
    lineCap: string;
    fillStyle: string;
    primaryColor: string;
}

export interface Rectangle extends ToolProperties {
    type: string;
    primaryColor: string;
    secondaryColor: string;
    width: number;
    height: number;
    topLeftPoint: Vec2;
    fillStyle: number;
    isShiftDown: boolean;
    lineWidth: number;
}

export interface Ellipse extends ToolProperties {
    lastPoint: Vec2;
    firstPoint: Vec2;
    type: string;
    primaryColor: string;
    secondaryColor: string;
    fillStyle: number;
    isShiftDown: boolean;
    center: Vec2;
    radius: Vec2;
    lineWidth: number;
}

export interface Line extends ToolProperties {
    type: string;
    primaryColor: string;
    secondaryColor: string;
    mouseClicks: Vec2[];
    isDot: boolean;
    lineCap: string;
    lineWidth: number;
    line: StraightLine;
    storedLines: StraightLine[];
    isShiftDoubleClick: boolean;
    hasLastPointBeenChanged: boolean;
    dotWidth: number;
}

export interface Polygon extends ToolProperties {
    type: string;
    primaryColor: string;
    secondaryColor: string;
    fillStyle: number;
    lineWidth: number;
    circleHeight: number;
    circleWidth: number;
    firstPoint: Vec2;
    lastPoint: Vec2;
    sides: number;
}

export interface Resize extends ToolProperties {
    type: string;
    canvasSize: Vec2;
    imageData: ImageData;
}

export interface Fill extends ToolProperties {
    type: string;
    imageData: ImageData;
}

export interface Selection extends ToolProperties {
    type: string;
    imageData: ImageData;
}

export interface Spray extends ToolProperties {
    type: string;
    imageData: ImageData;
}

export interface Pen extends ToolProperties {
    type: string;
    imageData: ImageData;
}

export interface Text extends ToolProperties {
    type: string;
    imageData: ImageData;
}
export interface Stamp extends ToolProperties {
    type: string;
    color: string;
    size: number;
    position: Vec2;
    currentStamp: StampAttributes;
    angle: number;
}
