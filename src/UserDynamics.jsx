import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState, useRef } from "react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const UserDynamics = ({ items, you, members }) => {
    const [analysis, setAnalysis] = useState("Analysing board...");
    const lastAnalysisTimeRef = useRef(Date.now());

    useEffect(() => {
        const analyse = async () => {
            const now = Date.now();
            if (now - lastAnalysisTimeRef.current < 60000) {
                return; // Skip analysis if 15 seconds haven't passed
            }

            lastAnalysisTimeRef.current = now; // Update the last analysis time

            const participantItems = items.filter((item) => item.createdBy !== you.id);

            if (participantItems.length === 0) {
                setAnalysis("No participant items to analyze.");
            } else {
                const prompt = `I am analyzing a list of items from a Miro board to understand the dynamics among participants. 
                
                Each item has attributes like type, content, createdBy, modifiedBy, createdAt, and others. 
                The items are structured as follows:
                {
                    "type": "shape",
                    "content": "",
                    "shape": "rectangle",
                    "style": {...},
                    "id": "...",
                    "parentId": null,
                    "origin": "center",
                    "relativeTo": "canvas_center",
                    "createdAt": "2024-08-28T21:03:24.256Z",
                    "createdBy": "...",
                    "modifiedAt": "2024-08-28T21:03:26.040Z",
                    "modifiedBy": "...",
                    "connectorIds": [],
                    "x": ...,
                    "y": ...,
                    "width": 120,
                    "height": 120,
                    "rotation": 0
                }
                
                I would like you to:
                - Analyze the list of items based on the createdBy and modifiedBy fields to identify who is most active.
                - Determine if there are collaborative patterns based on modification timestamps (createdAt and modifiedAt).
                - Provide a summary of participant engagement, highlighting any notable trends (e.g., frequent contributions, time of activity).
                - Keep the descriptions concise and focused on dynamics rather than content.
                
                - Refer to participants by name not id. Here is a list of board members ids and names: ${JSON.stringify(members)}
                
                Output Format:
                - A concise summary of dynamics in about 20 words
                
                Item list:
                ${JSON.stringify(participantItems)}
                `;

                try {
                    const result = await model.generateContent(prompt);
                    const analysisText = result.response.text();
                    console.log("AI analysis:", analysisText);
                    setAnalysis(analysisText);
                } catch (error) {
                    console.error("Error generating AI analysis:", error);
                    setAnalysis("Failed to analyze the board.");
                }
            }
        };

        analyse(); // Perform analysis on every update to `items`

    }, [items, you.id, members, model]);

    return (
        <>
            <div className="widget widget-full">
                <h1 className="widget-title">User Dynamics [AI Generated]</h1>
                <div className="widget-scrollable">
                    <p className="member-info">{analysis}</p>
                </div>
            </div>
        </>
    );
};

export default UserDynamics;
