export interface Point {
    x: number;
    y: number;
}

export type Tool =
    | "pencil"
    | "line"
    | "rectangle"
    | "circle"
    | "triangle"
    | "eraser";

export interface Stroke {
    id: string;
    type: Tool;
    points: Point[];
    color: string;
    width: number;
    filled: boolean;
}

export default class Whiteboard {

    strokes: Stroke[] = [];

    private drawing = false;
    private current: Stroke | null = null;

    color = "#171923";
    width = 3;
    tool: Tool = "pencil";
    filled = true;

    constructor(
        private canvas: HTMLCanvasElement,
        private onStroke: (stroke: Stroke) => void,
        private onErase?: (strokeIds: string[]) => void
    ) {
        canvas.addEventListener("pointerdown", this.start);
        canvas.addEventListener("pointermove", this.move);
        window.addEventListener("pointerup", this.end);
    }

    private point(e: PointerEvent): Point {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    private start = (e: PointerEvent) => {

        if (e.button !== 0) return;

        const p = this.point(e);

        this.drawing = true;

        this.canvas.setPointerCapture?.(e.pointerId);

        /*
         * ERASER
         */
        if (this.tool === "eraser") {
            this.erase(p);
            return;
        }

        /*
         * Create a new stroke
         */
        this.current = {
            id: crypto.randomUUID(),

            type: this.tool,

            points: [p],

            color: this.color,

            width: this.width,

            filled:
                this.filled &&
                this.tool !== "pencil" &&
                this.tool !== "line"
        };

        /*
         * Pencil is added immediately because
         * it continuously receives points.
         */
        if (this.tool === "pencil") {
            this.strokes.push(this.current);
        }

        this.render();
    };

    private move = (e: PointerEvent) => {

        if (!this.drawing) return;

        const p = this.point(e);

        /*
         * ERASER
         */
        if (this.tool === "eraser") {
            this.erase(p);
            return;
        }

        if (!this.current) return;

        /*
         * PENCIL
         */
        if (this.tool === "pencil") {

            this.current.points.push(p);

            this.render();

            return;
        }

        /*
         * SHAPES
         *
         * Shape only needs:
         * [0] = starting point
         * [1] = current point
         */
        this.current.points = [
            this.current.points[0],
            p
        ];

        this.render();

        /*
         * Draw temporary preview
         */
        this.drawStroke(
            this.canvas.getContext("2d")!,
            this.current
        );
    };

    private end = () => {

        if (!this.drawing) return;

        this.drawing = false;

        /*
         * Eraser does not create a stroke.
         */
        if (this.tool === "eraser") {
            this.current = null;
            return;
        }

        if (!this.current) return;

        /*
         * Prevent a zero-length shape.
         */
        if (this.current.points.length === 1) {

            this.current.points.push({
                ...this.current.points[0],
                x: this.current.points[0].x + 1
            });
        }

        /*
         * Shapes are added when finished.
         */
        if (this.tool !== "pencil") {
            this.strokes.push(this.current);
        }

        /*
         * Send to Socket.IO.
         */
        this.onStroke(this.current);

        this.current = null;

        this.render();
    };

    addStroke(stroke: Stroke) {

        /*
         * Prevent receiving your own stroke twice.
         */
        if (
            this.strokes.some(
                existing => existing.id === stroke.id
            )
        ) {
            return;
        }

        this.strokes.push(stroke);

        this.render();
    }

    removeStrokes(ids: string[]) {

        this.strokes = this.strokes.filter(
            stroke => !ids.includes(stroke.id)
        );

        this.render();
    }

    clear() {

        this.strokes = [];

        this.render();
    }

    private erase(point: Point) {

        const eraserSize =
            Math.max(20, this.width * 4);

        const removedIds: string[] = [];

        this.strokes = this.strokes.filter(stroke => {

            const hit =
                stroke.points.some(p => {

                    const dx = p.x - point.x;
                    const dy = p.y - point.y;

                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );

                    return distance <= eraserSize;
                });

            if (hit) {
                removedIds.push(stroke.id);
                return false;
            }

            return true;
        });

        if (removedIds.length > 0) {

            this.render();

            this.onErase?.(removedIds);
        }
    }

    render() {

        const ctx = this.canvas.getContext("2d")!;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const stroke of this.strokes) {

            this.drawStroke(ctx, stroke);

        }
    }

    private drawStroke(
        ctx: CanvasRenderingContext2D,
        stroke: Stroke
    ) {

        const points = stroke.points;

        if (points.length < 2) return;

        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        /*
         * PENCIL
         */
        if (stroke.type === "pencil") {

            ctx.beginPath();

            ctx.moveTo(
                points[0].x,
                points[0].y
            );

            for (let i = 1; i < points.length; i++) {

                ctx.lineTo(
                    points[i].x,
                    points[i].y
                );

            }

            ctx.stroke();

            return;
        }

        /*
         * LINE
         */
        if (stroke.type === "line") {

            const start = points[0];
            const end = points[1];

            ctx.beginPath();

            ctx.moveTo(
                start.x,
                start.y
            );

            ctx.lineTo(
                end.x,
                end.y
            );

            ctx.stroke();

            return;
        }

        /*
         * RECTANGLE
         */
        if (stroke.type === "rectangle") {

            const start = points[0];
            const end = points[1];

            const x = Math.min(
                start.x,
                end.x
            );

            const y = Math.min(
                start.y,
                end.y
            );

            const width = Math.abs(
                end.x - start.x
            );

            const height = Math.abs(
                end.y - start.y
            );

            ctx.beginPath();

            ctx.rect(
                x,
                y,
                width,
                height
            );

            if (stroke.filled) {

                ctx.fillStyle = stroke.color;

                ctx.fill();
            }

            ctx.stroke();

            return;
        }

        /*
         * CIRCLE
         */
        if (stroke.type === "circle") {

            const start = points[0];
            const end = points[1];

            const dx = end.x - start.x;
            const dy = end.y - start.y;

            const radius =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            ctx.beginPath();

            ctx.arc(
                start.x,
                start.y,
                radius,
                0,
                Math.PI * 2
            );

            if (stroke.filled) {

                ctx.fillStyle = stroke.color;

                ctx.fill();
            }

            ctx.stroke();

            return;
        }

        /*
         * TRIANGLE
         */
        if (stroke.type === "triangle") {

            const start = points[0];
            const end = points[1];

            const width =
                end.x - start.x;

            const topX =
                start.x + width / 2;

            const topY =
                start.y;

            const leftX =
                start.x;

            const rightX =
                end.x;

            const bottomY =
                end.y;

            ctx.beginPath();

            ctx.moveTo(
                topX,
                topY
            );

            ctx.lineTo(
                leftX,
                bottomY
            );

            ctx.lineTo(
                rightX,
                bottomY
            );

            /*
             * Connect the final point
             * back to the starting point.
             */
            ctx.closePath();

            if (stroke.filled) {

                ctx.fillStyle = stroke.color;

                ctx.fill();
            }

            ctx.stroke();

            return;
        }
    }
}