"use client";

import { useEffect } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

interface TourGuideProps {
    tourKey: string; // e.g. "forge-tour" or "arena-tour"
}

export default function TourGuide({ tourKey }: TourGuideProps) {
    useEffect(() => {
        const hasCompleted = localStorage.getItem(`vlyxir-completed-${tourKey}`);
        console.log("TourGuide useEffect mounted. tourKey:", tourKey, "hasCompleted:", hasCompleted);
        
        const runTour = () => {
            console.log("TourGuide calling runTour for tourKey:", tourKey);
            
            const steps: DriveStep[] = tourKey === "arena-tour" ? [
                {
                    popover: {
                        title: "Welcome to Vlyxir Arena! ⚔️",
                        description: "Let's take a quick tour of your coding battlefield.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="arena-problem-list"]',
                    popover: {
                        title: "Choose a Challenge",
                        description: "Browse and select your programming problem from the curated database sidebar.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="arena-problem-description"]',
                    popover: {
                        title: "Read the Brief",
                        description: "Analyze the problem description, constraints, and test cases carefully before writing your solution.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="arena-code-editor"]',
                    popover: {
                        title: "Write & Submit Code",
                        description: "Code your solution here, execute dry runs with test cases, and click submit when ready for the final evaluation.",
                        side: "left",
                        align: "start"
                    }
                }
            ] : [
                {
                    popover: {
                        title: "Welcome to Vlyxir Forge! 🚀",
                        description: "Let's take a quick 1-minute tour of your integrated prototyping environment.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="code-editor"]',
                    popover: {
                        title: "The Code Workspace",
                        description: "Write, edit, and experiment. Powered by Monaco (VS Code engine) with full autocompletions and hotkeys.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="editor-toolbar"]',
                    popover: {
                        title: "Settings & Actions",
                        description: "Adjust font size, switch language, format code, and customize editor settings to your comfort.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: '[data-tour="testing-panel"]',
                    popover: {
                        title: "Input Stream",
                        description: "Provide arguments and inputs that your code will read during execution.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="output-panel"]',
                    popover: {
                        title: "Output Sink",
                        description: "See your standard output, stderr, performance durations, and status codes after running code.",
                        side: "left",
                        align: "start"
                    }
                },
                {
                    element: '[data-tour="problem-panel"]',
                    popover: {
                        title: "Workspace Title",
                        description: "View the workspace context, current mode, and run/debug controls.",
                        side: "bottom",
                        align: "center"
                    }
                }
            ];

            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps,
                onDestroyed: () => {
                    localStorage.setItem(`vlyxir-completed-${tourKey}`, "true");
                }
            });

            console.log("TourGuide driverObj created. Calling drive()");
            driverObj.drive();
        };

        if (!hasCompleted) {
            console.log("TourGuide scheduling auto-run timer...");
            // Delay slightly to allow page load/hydration & animations to complete cleanly
            const timer = setTimeout(() => {
                console.log("TourGuide auto-run timer fired.");
                runTour();
            }, 1200);
            return () => {
                console.log("TourGuide auto-run timer cleared.");
                clearTimeout(timer);
            };
        }

        // Listen for manual trigger events
        const handleManualTour = () => {
            console.log("TourGuide manual trigger event received!");
            runTour();
        };

        console.log("TourGuide adding event listener for:", `trigger-${tourKey}`);
        window.addEventListener(`trigger-${tourKey}`, handleManualTour);
        return () => {
            console.log("TourGuide removing event listener for:", `trigger-${tourKey}`);
            window.removeEventListener(`trigger-${tourKey}`, handleManualTour);
        };
    }, [tourKey]);

    return null;
}
