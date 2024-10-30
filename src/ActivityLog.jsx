import { useState, useEffect, useRef } from "react";

const ActivityLog = ({ items, online, you, members }) => {
    const [logs, setLogs] = useState([]);
    const [previousItems, setPreviousItems] = useState([]);
    const [previousOnline, setPreviousOnline] = useState([]);
    const leftUsersSet = useRef(new Set());
    const isFirstRender = useRef(true); // Track initial mount

    useEffect(() => {
        const now = new Date(); // Capture current time as a Date object

        
        
            const createdItems = items.filter(current => 
                !previousItems.some(prev => prev.id === current.id) &&
                new Date(current.createdAt).getTime()
            );

            if (createdItems.length > 0) {
                const newCreateLogs = createdItems.map(item => { 
                    const whoID = item.createdBy;
                    const who = members.find(user => user.id === whoID); 
                    const itemType = item.type.replace(/_/g, ' ');

                    return (
                        <p className="member-info" key={item.id}>
                            {`${who?.name || 'Someone'} created a `}
                            <span className="interactable" onClick={async () => {
                                await miro.board.viewport.setZoom(3);
                                await miro.board.viewport.zoomTo(item);
                            }}>
                                {itemType}
                            </span>
                            {` [${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}]`}
                        </p>
                    );
                });
                setLogs(prevLogs => [...newCreateLogs, ...prevLogs]);
            }
       

        const updatedItems = items.filter(current => {
            const previous = previousItems.find(prev => prev.id === current.id);
            return previous && previous.modifiedAt !== current.modifiedAt;
        });

        if (updatedItems.length > 0) {
            updatedItems.forEach(item => {
                const whoID = item.modifiedBy;
                const who = online.find(user => user.id === whoID);
                const itemType = item.type.replace(/_/g, ' ');

                const logMessage = (
                    <p className="member-info" key={item.id}>
                        {`${who?.name || 'Someone'} updated a `}
                        <span className="interactable" onClick={async () => {
                            await miro.board.viewport.setZoom(3);
                            await miro.board.viewport.zoomTo(item);
                        }}>
                            {itemType}
                        </span>
                        {` [${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}]`}
                    </p>
                );

                setLogs(prevLogs => [logMessage, ...prevLogs]);
            });
        }

        setPreviousItems(items);

        // Reset initial mount flag after first render
        if (isFirstRender.current) isFirstRender.current = false;
    }, [items, online]);

    useEffect(() => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const usersWhoLeft = previousOnline.filter(user => !online.some(u => u.id === user.id));
        if (usersWhoLeft.length > 0) {
            const newLeaveLogs = usersWhoLeft.filter(user => !leftUsersSet.current.has(user.id))
                .map(user => {
                    leftUsersSet.current.add(user.id);
                    return (
                        <p className="member-info" key={`${user.id}-left`}>
                            {`${user.name} left the board [${now}]`}
                        </p>
                    );
                });
            setLogs(prevLogs => [...newLeaveLogs, ...prevLogs]);
        }

        const newUsers = online.filter(user => !previousOnline.some(u => u.id === user.id));
        if (newUsers.length > 0) {
            const newJoinLogs = newUsers.map(user => {
                leftUsersSet.current.delete(user.id);
                return (
                    <p className="member-info" key={`${user.id}-joined`}>
                        {`${user.name} joined the board [${now}]`}
                    </p>
                );
            });
            setLogs(prevLogs => [...newJoinLogs, ...prevLogs]);
        }

        setPreviousOnline(online);
    }, [online]);

    return (
        <div className='widget widget-full'>
            <h1 className='widget-title'>Activity Log</h1>
            <div className='widget-scrollable'>
                {logs.length > 0 ? logs.map((log, idx) => (
                    <div key={idx} className='member-info'>{log}</div>
                )) : <p>No activity yet.</p>}
            </div>
        </div>
    );
};

export default ActivityLog;
