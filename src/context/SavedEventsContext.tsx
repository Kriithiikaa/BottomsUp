import React, { createContext, useContext, useState, ReactNode } from "react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  description: string;
  image?: string;
  live?: boolean;
  rsvped?: boolean;
}

interface SavedEventsContextType {
  savedEvents: Event[];
  rsvpedEvents: Event[];
  saveEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  toggleRSVP: (eventId: string) => void; // ⭐ FIXED
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(
  undefined
);

export const SavedEventsProvider = ({ children }: { children: ReactNode }) => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);

  /* -----------------------------
       SAVE EVENT 
  ------------------------------ */
  const saveEvent = (event: Event) => {
    setSavedEvents((prev) => {
      if (prev.some((e) => e.id === event.id)) return prev;
      return [...prev, { ...event, rsvped: false }];
    });
  };

  /* -----------------------------
       REMOVE EVENT 
  ------------------------------ */
  const removeEvent = (eventId: string) => {
    setSavedEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    setRsvpedEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  /* -----------------------------
       ⭐ TOGGLE RSVP — universal
  ------------------------------ */
  const toggleRSVP = (eventId: string) => {
    setSavedEvents((prev) => {
      return prev.map((ev) => {
        if (ev.id === eventId) {
          const updated = { ...ev, rsvped: !ev.rsvped };

          // update RSVP list accordingly
          if (updated.rsvped) {
            // add
            setRsvpedEvents((rsvpList) => {
              if (rsvpList.some((e) => e.id === eventId)) return rsvpList;
              return [...rsvpList, updated];
            });
          } else {
            // remove
            setRsvpedEvents((rsvpList) =>
              rsvpList.filter((e) => e.id !== eventId)
            );
          }

          return updated;
        }
        return ev;
      });
    });
  };

  return (
    <SavedEventsContext.Provider
      value={{
        savedEvents,
        rsvpedEvents,
        saveEvent,
        removeEvent,
        toggleRSVP, // ⭐ EXPOSED HERE
      }}
    >
      {children}
    </SavedEventsContext.Provider>
  );
};

export const useSavedEvents = () => {
  const context = useContext(SavedEventsContext);
  if (!context) {
    throw new Error("useSavedEvents must be used within a SavedEventsProvider");
  }
  return context;
};
