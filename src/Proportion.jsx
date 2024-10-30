import { PieChart } from "@mui/x-charts";
import { useEffect, useState } from "react";

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

const Proportion = ({ items, members, you }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const proportions = [];
        const totalCount = items.length;

        // Add the "Activities" data for the current user first
        const userContributions = items.filter((item) => item.createdBy === you.id);
        proportions.push({
            id: you.id,
            value: Math.round((userContributions.length / totalCount) * 100),
            label: "You"
        });

        // Add data for other members
        members.forEach(member => {
            if (member.id !== you.id) {
                const contributions = items.filter((item) => item.createdBy === member.id);
                proportions.push({
                    id: member.id,
                    value: Math.round((contributions.length / totalCount) * 100),
                    label: member.name
                });
            }
        });

        setData(proportions);
    }, [items, members, you.id]);

    return (
        <>
            <div className="widget">
                <h1 className="widget-title">Board Share</h1>
                    <div className="chart-container">
                        <PieChart

                            colors={palette}
                            series={[
                                {
                                    data: data,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                    innerRadius: 10,
                                    outerRadius: 40,
                                    paddingAngle: 5,
                                    cornerRadius: 5,
                                    startAngle: -90,
                                    endAngle: 270,
                                    cx: 55,
                                    cy: 70
                                }
                            ]}
                            
                            slotProps={{
                                legend: {
                                    direction: 'row',
                                    position: { vertical: 'top', horizontal: 'middle' },
                                    padding: 0,
                                    labelStyle: {
                                        fontSize: 12,
                                    },   
                                    itemMarkWidth: 5,
                                    itemMarkHeight: 5,
                                    markGap: 5,
                                    itemGap: 5,
                                },
                            }}
                            />
                    </div>
            </div>
        </>
    );
};

export default Proportion;
