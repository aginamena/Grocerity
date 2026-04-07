import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { chromium } from "playwright";

// Global variables to persist browser and page across requests (not production-ready)
let globalBrowser: any = null;
let globalPage: any = null;
let isPageInitialized = false;

function normalizeKey(key: string) {
  switch (key) {
    case "ENTER":
    case "RETURN":
      return "Enter";
    case "ESC":
    case "ESCAPE":
      return "Escape";
    case "TAB":
      return "Tab";
    case "SPACE":
      return "Space";
    case "BACKSPACE":
      return "Backspace";
    case "DELETE":
    case "DEL":
      return "Delete";
    case "HOME":
      return "Home";
    case "END":
      return "End";
    case "PAGEUP":
      return "PageUp";
    case "PAGEDOWN":
      return "PageDown";
    case "UP":
    case "ARROWUP":
      return "ArrowUp";
    case "DOWN":
    case "ARROWDOWN":
      return "ArrowDown";
    case "LEFT":
    case "ARROWLEFT":
      return "ArrowLeft";
    case "RIGHT":
    case "ARROWRIGHT":
      return "ArrowRight";
    case "CTRL":
    case "CONTROL":
      return "Control";
    case "SHIFT":
      return "Shift";
    case "OPTION":
    case "ALT":
      return "Alt";
    case "META":
    case "CMD":
    case "COMMAND":
      return "Meta";
    default:
      return key;
  }
}

function normalizeDragPath(path: any) {
  if (!Array.isArray(path)) {
    throw new Error("drag action requires a path array");
  }

  return path.map((point) => {
    if (Array.isArray(point) && point.length >= 2) {
      return [point[0], point[1]];
    }
    if (point && typeof point === "object" && "x" in point && "y" in point) {
      return [point.x, point.y];
    }
    throw new Error(
      "drag path entries must be coordinate pairs or {x, y} objects"
    );
  });
}


// Add a delay function
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Add a human-like random delay
function randomDelay(min: number, max: number) {
  return delay(Math.random() * (max - min) + min);
}

async function handleComputerActions(page: any, actions: any[]) {
  for (const action of actions) {
    switch (action.type) {
      case "click":
        await randomDelay(100, 300); // Small delay before clicking
        await page.mouse.click(action.x, action.y, {
          button: action.button ?? "left",
        });
        break;
      case "double_click":
        await randomDelay(100, 300);
        await page.mouse.dblclick(action.x, action.y, {
          button: action.button ?? "left",
        });
        break;
      case "drag": {
        const path = normalizeDragPath(action.path);
        if (path.length < 2)
          throw new Error("Drag requires at least two points");
        const [[startX, startY], ...rest] = path;
        await randomDelay(150, 400);
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        for (const [x, y] of rest) {
          await randomDelay(30, 100);
          await page.mouse.move(x, y);
        }
        await page.mouse.up();
        break;
      }
      case "move":
        await randomDelay(100, 200);
        await page.mouse.move(action.x, action.y);
        break;
      case "scroll":
        await randomDelay(100, 250);
        await page.mouse.move(action.x, action.y);
        await page.mouse.wheel(action.scrollX ?? 0, action.scrollY ?? 0);
        break;
      case "keypress":
        for (const key of action.keys) {
          await randomDelay(50, 150);
          await page.keyboard.press(normalizeKey(key));
        }
        break;
      case "type":
        // Type slowly, character by character, to appear human-like
        const text = action.text;
        for (let i = 0; i < text.length; i++) {
          await randomDelay(50, 150); // 50-150ms delay between each character
          await page.keyboard.type(text[i]);
        }
        break;
      case "wait":
      case "screenshot":
        break;
      default:
        console.warn(`Unsupported action: ${action.type}`);
    }
  }
}

async function computerUseLoop(page: any, client: any, initialPrompt: string) {
  let response = await client.responses.create({
    model: "gpt-5.4",
    tools: [{ type: "computer" }],
    input: initialPrompt,
  });

  while (true) {
    const computerCall = response.output.find(
      (item: any) => item.type === "computer_call"
    );
    if (!computerCall) {
      return response;
    }

    await handleComputerActions(page, computerCall.actions);

    const screenshot = await page.screenshot({ type: "png" });
    const screenshotBase64 = Buffer.from(screenshot).toString("base64");

    response = await client.responses.create({
      model: "gpt-5.4",
      tools: [{ type: "computer" }],
      previous_response_id: response.id,
      input: [
        {
          type: "computer_call_output",
          call_id: computerCall.call_id,
          output: {
            type: "computer_screenshot",
            image_url: `data:image/png;base64,${screenshotBase64}`,
          },
        },
      ],
    });
  }
}

function extractReply(response: any) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  if (Array.isArray(response.output)) {
    return response.output
      .filter((item: any) => item.type === "message" || item.type === "output_text")
      .map((item: any) => {
        if (typeof item.text === "string") return item.text;
        if (Array.isArray(item.content)) {
          return item.content.map((c: any) => c.text || "").join(" ");
        }
        return "";
      })
      .join(" ")
      .trim();
  }

  return "";
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const client = new OpenAI();

    // Launch browser only once
    if (!globalBrowser) {
      globalBrowser = await chromium.launch({
        headless: false,
        chromiumSandbox: true,
        env: {},
        args: ["--disable-extensions", "--disable-file-system"],
      });
      globalPage = await globalBrowser.newPage({
        viewport: { width: 1280, height: 720 },
      });
    }

    // Navigate to the website only once
    if (!isPageInitialized) {
      await globalPage.goto("https://z-library.la");
      await globalPage.waitForLoadState("networkidle");
      isPageInitialized = true;
    }

    const finalResult = await computerUseLoop(globalPage, client, prompt);
    const reply = extractReply(finalResult);

    return NextResponse.json({ reply,
         result: finalResult.output
         });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}