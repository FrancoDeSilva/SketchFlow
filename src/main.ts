import { io } from "socket.io-client";
import Whiteboard, { type Stroke, type Tool } from "./whiteboard";

const roomId =
    new URLSearchParams(location.search).get("room");

if (!roomId) {
    location.replace("/rooms.html");
}

const socket = io("http://localhost:3000");

document.body.innerHTML = `

<div id="toolbar" style="
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 10;
    width: 160px;
    padding: 12px;
    background: #2408c3;
    border: 2px solid #dfe3eb;
    border-radius: 14px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    font-family: Inter, system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 8px;
">

    <div style="
        font-size: 16px;
        font-weight: 700;
        text-align: center;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
    ">
        SKETCHFLOW
    </div>

    <div id="users" style="
        color: #697386;
        font-size: 12px;
        text-align: center;
        margin-bottom: 4px;
    ">
        Connecting…
    </div>

    <!-- Colour -->

    <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 4px;
    ">

        <span style="font-size: 13px;">
            Colour
        </span>

        <input
            id="color"
            type="color"
            value="#171923"
            title="Pen colour"
            style="
                width: 35px;
                height: 30px;
                border: 1px solid #d9deea;
                border-radius: 7px;
                background: none;
                padding: 2px;
                cursor: pointer;
            "
        >

    </div>

    <!-- Size -->

    <div style="
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 4px;
    ">

        <span style="font-size: 13px;">
            Size
        </span>

        <input
            id="width"
            type="range"
            min="1"
            max="20"
            value="3"
            title="Pen size"
            style="
                width: 100%;
                cursor: pointer;
            "
        >

    </div>

    <!-- Tools -->

    <button id="pencil" class="tool-button">
        ✏️ Pencil
    </button>

    <button id="line" class="tool-button">
        ╱ Line
    </button>

    <button id="rectangle" class="tool-button">
        ▢ Rectangle
    </button>

    <button id="circle" class="tool-button">
        ◯ Circle
    </button>

    <button id="triangle" class="tool-button">
        △ Triangle
    </button>

    <button id="eraser" class="tool-button">
        🧹 Eraser
    </button>

    <button id="filler" class="tool-button">
        🪣 Fill: ON
    </button>

    <div style="
        height: 1px;
        background: #e5e7eb;
        margin: 4px 0;
    "></div>

    <!-- Actions -->

    <button id="clear" class="dark-button">
        🗑️ Clear
    </button>

    <button id="download" class="tool-button">
        ⬇️ Download
    </button>

    <button id="rooms" class="tool-button">
        🏠 Rooms
    </button>

</div>

<canvas
    id="canvas"
    style="
        display: block;
        touch-action: none;
        background: white;
    "
></canvas>

<div
    id="status"
    style="
        position: fixed;
        bottom: 14px;
        left: 14px;
        padding: 8px 10px;
        background: #fff;
        border: 1px solid #e2e5ec;
        border-radius: 8px;
        font: 13px Inter, system-ui, sans-serif;
        color: #697386;
        z-index: 10;
    "
>
    Connecting…
</div>

<style>

.tool-button,
.dark-button {

    border-radius: 9px;

    padding: 10px;

    cursor: pointer;

    font-size: 14px;

    transition:
        background 0.15s,
        color 0.15s,
        border 0.15s;
}

.tool-button {

    border: 1px solid #d9deea;

    background: white;

    color: #171923;
}

.tool-button:hover {

    background: #f4f5f7;
}

.tool-button.active {

    background: #171923;

    color: white;

    border-color: #171923;
}

.dark-button {

    border: 0;

    background: #171923;

    color: white;

    font-weight: 600;
}

.dark-button:hover {

    background: #2c3040;
}

</style>
`;

const canvas =
    document.getElementById(
        "canvas"
    ) as HTMLCanvasElement;

const users =
    document.getElementById(
        "users"
    )!;

const status =
    document.getElementById(
        "status"
    )!;

const title =
    document.querySelector(
        "#toolbar > div:first-child"
    )!;

/*
 * Create whiteboard.
 *
 * First callback:
 *     Send new stroke to server.
 *
 * Second callback:
 *     Send erased stroke IDs to server.
 */
const whiteboard = new Whiteboard(
    canvas,

    (stroke: Stroke) => {

        socket.emit(
            "draw stroke",
            stroke
        );

    },

    (strokeIds: string[]) => {

        socket.emit(
            "erase strokes",
            strokeIds
        );

    }
);


/*
 * Canvas resizing
 */
function resize() {

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        Math.floor(
            innerWidth * dpr
        );

    canvas.height =
        Math.floor(
            innerHeight * dpr
        );

    canvas.style.width =
        `${innerWidth}px`;

    canvas.style.height =
        `${innerHeight}px`;

    const ctx =
        canvas.getContext("2d")!;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    whiteboard.render();
}

window.addEventListener(
    "resize",
    resize
);

resize();


/*
 * Tool buttons
 */
const tools: Tool[] = [
    "pencil",
    "line",
    "rectangle",
    "circle",
    "triangle",
    "eraser"
];

tools.forEach(tool => {

    const button =
        document.getElementById(tool);

    button?.addEventListener(
        "click",
        () => {

            whiteboard.tool = tool;

            /*
             * Update active button.
             */
            document
                .querySelectorAll(
                    ".tool-button"
                )
                .forEach(element => {

                    element.classList.remove(
                        "active"
                    );

                });

            button.classList.add(
                "active"
            );
        }
    );
});


/*
 * Start with pencil selected.
 */
document
    .getElementById("pencil")
    ?.classList.add("active");


/*
 * Colour
 */
const color =
    document.getElementById(
        "color"
    ) as HTMLInputElement;

color.addEventListener(
    "input",
    () => {

        whiteboard.color =
            color.value;

    }
);


/*
 * Width
 */
const width =
    document.getElementById(
        "width"
    ) as HTMLInputElement;

width.addEventListener(
    "input",
    () => {

        whiteboard.width =
            Number(width.value);

    }
);


/*
 * Fill button
 */
const filler =
    document.getElementById(
        "filler"
    )!;

filler.addEventListener(
    "click",
    () => {

        whiteboard.filled =
            !whiteboard.filled;

        filler.textContent =
            whiteboard.filled
                ? "🪣 Fill: ON"
                : "🪣 Fill: OFF";

    }
);


/*
 * Socket connected
 */
socket.on(
    "connect",
    () => {

        status.textContent =
            "Connected";

        socket.emit(
            "join room",
            roomId,
            (result: any) => {

                if (!result.ok) {

                    status.textContent =
                        result.error;

                    return;
                }

                title.textContent =
                    result.room.name;

                whiteboard.strokes =
                    result.strokes as Stroke[];

                whiteboard.render();
            }
        );
    }
);


/*
 * Socket disconnected
 */
socket.on(
    "disconnect",
    () => {

        status.textContent =
            "Disconnected — reconnecting…";

    }
);


/*
 * Receive new drawing
 */
socket.on(
    "draw stroke",
    (stroke: Stroke) => {

        whiteboard.addStroke(
            stroke
        );

    }
);


/*
 * Receive erase operation
 */
socket.on(
    "erase strokes",
    (strokeIds: string[]) => {

        whiteboard.removeStrokes(
            strokeIds
        );

    }
);


/*
 * Clear board
 */
socket.on(
    "clear board",
    () => {

        whiteboard.clear();

    }
);


/*
 * Number of users
 */
socket.on(
    "room users",
    (count: number) => {

        users.textContent =
            `${count} user${
                count === 1
                    ? ""
                    : "s"
            }`;

    }
);


/*
 * Connection error
 */
socket.on(
    "connect_error",
    () => {

        status.textContent =
            "Cannot connect to server";

    }
);


/*
 * Clear
 */
document
    .getElementById("clear")!
    .addEventListener(
        "click",
        () => {

            socket.emit(
                "clear board"
            );

        }
    );


/*
 * Rooms
 */
document
    .getElementById("rooms")!
    .addEventListener(
        "click",
        () => {

            location.href =
                "/rooms.html";

        }
    );


/*
 * Download
 */
document
    .getElementById("download")!
    .addEventListener(
        "click",
        () => {

            const link =
                document.createElement("a");

            link.download =
                `${
                    title.textContent ||
                    "whiteboard"
                }.png`;

            link.href =
                canvas.toDataURL(
                    "image/png"
                );

            link.click();

        }
    );