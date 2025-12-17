// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react';
// IMPORTANTE: Asegúrate de que termine en 'Notifications.css' (con S)
import '../styles/Notifications.css'; 

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notif, setNotif] = useState({ open: false, title: '', message: '', type: 'success' });

    const showNotif = (message, type = 'success', title = 'Axis') => {
        setNotif({ open: true, message, type, title });
    };

    const closeNotif = () => setNotif({ ...notif, open: false });

    return (
        <NotificationContext.Provider value={{ showNotif }}>
            {children}
            {notif.open && (
                <div className="modal-overlay">
                    <div className={`modal-notif ${notif.type}`}>
                        <h3>{notif.title}</h3>
                        <div className="message">
                            <span className="icon-check">
                                {notif.type === 'error' ? '✕' : '✓'}
                            </span>
                            <p>{notif.message}</p>
                        </div>
                        <button className="btn-accept" onClick={closeNotif}>Aceptar</button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotif = () => useContext(NotificationContext);