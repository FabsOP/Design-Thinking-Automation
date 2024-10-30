import React, { useEffect, useState } from "react";

const palette = [
    "#1aa84a",
    "#9ef7c0",
    "#FF7F33", 
    "#db5c84",
    '#FF0000', 
    '#FF00FF', // Magenta
    '#FFFF00', // Yellow
    '#FFA500', // Orange
    
    '#0000FF', // Blue (Primary)
    
    '#00FFFF', // Cyan
    '#800080', // Purple
    
    '#000080', // Navy
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#D3D3D3', // Light Gray
    '#808080', // Gray
    '#000000', // Black
];

const Heatmap = ({ items: data, members }) => {
    function getItemsWithinViewport(items, viewport) {
        return items.filter(item => {
            if (item.type !== 'sticky_note') return false; // Only include sticky notes

            const itemLeft = item.x - item.width / 2;
            const itemRight = item.x + item.width / 2;
            const itemTop = item.y - item.height / 2;
            const itemBottom = item.y + item.height / 2;

            const isWithinHorizontalBounds = itemRight >= viewport.x && itemLeft <= (viewport.x + viewport.width);
            const isWithinVerticalBounds = itemBottom >= viewport.y && itemTop <= (viewport.y + viewport.height);

            return isWithinHorizontalBounds && isWithinVerticalBounds;
        });
    }

    const [viewport, setViewport] = useState(null);
    const [viewportItems, setViewportItems] = useState([]);

    useEffect(() => {
        const fetchViewport = async () => {
            const viewport = await miro.board.viewport.get();
            setViewport(viewport);

            if (data && viewport) {
                const itemsInViewport = getItemsWithinViewport(data, viewport);
                setViewportItems(itemsInViewport);
            }
        };

        fetchViewport();
        const intervalId = setInterval(fetchViewport, 100);
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [data]);

    // Calculate font size based on viewport area
    const calculateFontSize = () => {
        if (viewport) {
            const area = viewport.width * viewport.height;
            const baseFontSize = 20; // You can adjust this base size
            const minFontSize = 0; // Minimum font size
            const maxFontSize = 10; // Maximum font size

            // Calculate font size inversely proportional to the area
            const fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize * (1 / area * 1900000))); // Adjust the multiplier as needed
            return fontSize;
        }
        return 12; // Fallback font size if viewport is not available
    };

    const fontSize = calculateFontSize();

    return (
        <>
            <div className='widget widget-full'>
                <h1 className='widget-title'>Contribution Map</h1>
                <div className="heatmap" 
                onClick={(event)=>{
                    const rect = event.currentTarget.getBoundingClientRect();
                    const relativeX = event.clientX - rect.left;
                    const relativeY = event.clientY - rect.top;
                    console.log(`Click position: (${relativeX}px, ${relativeY}px)`);

                }} 
                style={{ position: "relative", width: "100%", height: "100%" }}>
                    <div className="crosshair" style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "2px",
                        height: "2px",
                        backgroundColor: "red",
                        zIndex: "10"
                    }}></div>
                    {viewportItems && viewportItems.map((item, idx) => {
                        const member = members.find(m => m.id === item.createdBy) || { name: "Unknown" };

                        const top = ((item.y - viewport.y) / viewport.height) * 100;
                        const left = ((item.x - viewport.x) / viewport.width) * 100;

                        const width = (item.width / viewport.width) * 100;
                        const height = (item.height / viewport.height) * 100;

                        return (
                            <div key={idx}
                                style={{
                                    position: "absolute",
                                    backgroundColor: palette[members.indexOf(member)],
                                    width: `${width}%`,
                                    height: `${height}%`,
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    transform: "translate(-50%, -50%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "black",
                                    fontSize: `${fontSize}px`, // Set font size based on viewport area
                                    textAlign: "center"
                                }}
                            >
                                {member.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Heatmap;
